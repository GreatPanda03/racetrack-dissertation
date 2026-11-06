# my own tool to convert DevOps work items to a Word document
# * combines the other test files (see them for sources)
# * the Word document can be saved as a PDF through Word
# * to execute, type ".\devops_to_pdf.ps1" in the terminal


### [[ Variables ]] ###

$Organisation   # DevOps organisation name
$Project        # target project within organisation
$PAT            # API token



### [[ WIT Gathering Functions ]] ###

# gathers all DevOps WITs from the given organisation's project
function Get-AllWorkItemRelations {
    param (
        [string] $PAT,
        [string] $Organisation,
        [string] $Project
    )

    $Base64AuthInfo = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes(":$($PAT)"))
    $Uri = "https://dev.azure.com/$Organisation/$Project/_apis/wit/wiql?api-version=7.0"
    $Wiql = @"
        {
        "query": "SELECT [System.Id]
                  FROM WorkItemLinks
                  WHERE ([Source].[System.TeamProject] = '$Project')
                  AND ([System.Links.LinkType] = 'System.LinkTypes.Hierarchy-Forward')
                  ORDER BY [System.Id]
                  MODE (Recursive)"
        }
"@

    $Response = Invoke-RestMethod -Uri $Uri -Method Post `
        -Headers @{Authorization=("Basic {0}" -f $Base64AuthInfo)} `
        -Body $Wiql -ContentType "application/json"

    return $Response
}


# gets the details of all WITs by the given IDs
function Get-WorkItemsByIds {
    param (
        [string] $PAT,
        [string] $Organisation,
        [int[]] $Ids
    )

    # retrieve WIT details in batches - limit is 200 at a time (which is probably fine)
    $Base64AuthInfo = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes(":$($PAT)"))
    $WorkItems = @()

    foreach ($Batch in ($Ids -split '(.{200})(?=.)' | Where-Object {$_ -ne ""})) {
        $Uri = "https://dev.azure.com/$Organisation/_apis/wit/workitems?ids=$Batch&api-version=7.0"
        
        $BatchResponse = Invoke-RestMethod -Uri $Uri -Method Get `
            -Headers @{Authorization=("Basic {0}" -f $Base64AuthInfo)}

        $WorkItems += $BatchResponse.value
    }

    return $WorkItems
}


# creates a tree of WITs from the given WITs and relations
function Get-TreeFromRelationsAndWorkItems {
    param (
        [array] $Relations,
        [array] $WorkItems
    )

    # lookup table for WITs
    $WorkItemsLookup = @{}
    $WorkItems | ForEach-Object { $WorkItemsLookup[$_.id] = $_ }

    # constructing the hierarchy as an array
    $Tree = @()

    foreach ($rel in $Relations.workItemRelations) {
        if (-not $rel.Source) { # top-level element (project)
            
            $Tree += @{
                Id = $rel.Target.Id
                Item = $WorkItemsLookup[$rel.Target.Id]
                Children = @()
            }

        } else { # child element (find parent recursively)
            $Parent = Find-NodeById $Tree $rel.Source.Id

            if ($Parent) {
                $Parent.Children += @{
                    Id = $rel.Target.Id
                    Item = $WorkItemsLookup[$rel.Target.Id]
                    Children = @()
                }
            }
        }
    }

    return $Tree
}


# auxiliary: recursive node search
function Find-NodeById {
    param (
        [object[]] $Nodes,
        [int] $Id
    )

    foreach ($node in $nodes) {
        if ($node.Id -eq $id) { return $node }

        if ($node.Children) {
            $found = Find-NodeById $node.Children $id

            if ($found) { return $found }
        }
    }

    return $null
}


# returns data associated with the given work item
function Get-WorkItemData {
    param (
        [object] $WorkItem
    )

    # * source for fields: https://learn.microsoft.com/en-us/rest/api/azure/devops/wit/work-items/list?view=azure-devops-rest-7.1&tabs=HTTP
    # * .id, .fields.System.WorkItemType, .fields.System.Title, .fields.System.State, .fields.System.CreatedDate, .rev, .fields.System.ChangedDate

    $CreatedDate = Get-FormattedTime $WorkItem.fields.'System.CreatedDate'
    $ChangedDate = Get-FormattedTime $WorkItem.fields.'System.ChangedDate'
    $StoryPoints = [int] $WorkItem.fields.'Microsoft.VSTS.Scheduling.StoryPoints'

    return @(
        $WorkItem.id,
        $WorkItem.fields.'System.WorkItemType',
        $WorkItem.fields.'System.Title',
        $WorkItem.fields.'System.State',
        $StoryPoints,
        $CreatedDate,
        $ChangedDate
    )
}



### [[ Word Document Functions ]] ###

# writes the given tree of WITs to a document of the given path
function Save-WorkItemsTreeAsWordDocument {
    param (
        [array] $Tree,
        [string] $FilePath
    )

    # creating document
    $Word = New-Object -ComObject Word.Application
    $Document = $Word.Documents.Add()
    
    $Word.Visible = $false
    $Word.ScreenUpdating = $false
    $Word.DisplayAlerts = 0

    $Selection = $Word.Selection

    # constant font styles
    $Selection.Font.Name = "Arial"
    $Selection.Font.Size = 11

    # setting document title
    $Selection.ParagraphFormat.Alignment = 1
    $Selection.Font.Bold = $true
    $Selection.TypeText("Work Item Document")

    # setting document description
    $Selection.TypeParagraph()
    $Selection.ParagraphFormat.Alignment = 3
    $Selection.Font.Bold = $false

    $Today = Get-Date -Format "dddd yyyy/MM/dd HH:mm"

    $Selection.TypeText("This document presents the current state of all Work Items in the project as of ")
    $Selection.Font.Bold = $true; $Selection.TypeText($Today); $Selection.Font.Bold = $false; $Selection.TypeText(". ")

    $Selection.TypeParagraph();
    $Selection.TypeText("Each Work Items includes details such as their title, current state, and the time of the last edit. ")
    $Selection.TypeText("For each Work Item, a link to it in the backlog has also been provided to observe the full details. ")
    $Selection.TypeText('The Work Item hierarchy goes in the order of "Project > Epics > Features > User Stories", with all child Work Items under their respective parents.')

    # backlog link
    $Selection.TypeParagraph()
    $Selection.TypeText("For the full backlog, please see the following link: ")
    $Selection.Hyperlinks.Add($Selection.Range, "https://dev.azure.com/$Organisation/$Project/_backlogs/backlog", $null, $null, '"The Racetrack Game" backlog')
    $Selection.TypeText(".")

    # WITs table
    $Selection.TypeParagraph()

    Write-Host "Creating table..."

    $TotalRows = $WorkItems.Count + 1

    $Table = Get-NewTable $Selection `
        @("ID", "Type", "Title", "State", "Points", "Created", "Last Changed") `
        $TotalRows

    # TODO: convert this to recursive loop

    $r = 2

    foreach ($project in $Tree) {
        $Data = Get-WorkItemData $project.Item
        Add-RowToTable $Table $r $Data
        Set-RowColourByType $Table $r 1 "Project"
        $r += 1

        foreach ($epic in $project.Children) {
            $Data = Get-WorkItemData $epic.Item
            Add-RowToTable $Table $r $Data
            Set-RowColourByType $Table $r 1 "Epic"
            $r += 1

            foreach ($feature in $epic.Children) {
                $Data = Get-WorkItemData $feature.Item
                Add-RowToTable $Table $r $Data
                Set-RowColourByType $Table $r 1 "Feature"
                $r += 1

                foreach ($story in $feature.Children) {
                    $Data = Get-WorkItemData $story.Item
                    Add-RowToTable $Table $r $Data
                    Set-RowColourByType $Table $r 1 "User Story"
                    $r += 1

                    foreach ($task in $story.Children) {
                        $Data = Get-WorkItemData $task.Item
                        Add-RowToTable $Table $r $Data
                        Set-RowColourByType $Table $r 1 "Task"
                        $r += 1
                    }
                }
            }
        }
    }

    # saving document
    $Document.SaveAs([ref] $FilePath, [ref] $SaveFormat::wdFormatDocument)
    $Word.Quit() # must quit even if not visible
}


# creates a new table with the given headers
function Get-NewTable {
    param (
        [object] $Selection,
        [string[]] $Headers,
        [int] $Rows
    )

    $Table = $Selection.Tables.add(
        $Selection.Range, $Rows, $Headers.Count,
        [Microsoft.Office.Interop.Word.WdDefaultTableBehavior]::wdWord9TableBehavior,
        [Microsoft.Office.Interop.Word.WdAutoFitBehavior]::wdAutoFitWindow
    )

    $Table.Style = "Plain Table 1" # "Grid Table 4 - Accent 4"
    $Table.Rows(1).Cells.VerticalAlignment = 1

    for ($c = 1; $c -le $Headers.Count; $c++) {
        $Table.cell(1, $c).range.Bold = $true
        $Table.cell(1, $c).range.Text = $Headers[$c - 1]
        $Table.cell(1, $c).range.ParagraphFormat.Alignment = 1
    }

    return $Table
}


# adds a new row to the given table
function Add-RowToTable {
    param (
        [object] $Table,
        [int] $Row,
        [array] $Data
    )

    $c = 1
    $Table.Rows($Row).Cells.VerticalAlignment = 1

    foreach ($Value in $Data) {
        $Table.cell($Row, $c).range.Bold = $false
        $Table.cell($Row, $c).range.Text = [string] $Value
        $Table.cell($Row, $c).range.ParagraphFormat.Alignment = 1
        $c += 1
    }

    # $Table.cell($Row, 0).range.Hyperlinks.Add(($Table.cell($Row, 0).range, "https://dev.azure.com/$Organisation/$Project/_backlogs/backlog/Project?workitem=440", $null, $null, [string] $Data[0]))
}


# auxiliary: returns the colour associated with the given R, G, and B values
function Get-RGB {
    param (
        [int] $R,
        [int] $G,
        [int] $B
    )

    return $R + ($G * 256) + ($B * 256 * 256)
}


# auxiliary: converts a YYYY-MM-DDTHH:MM:SS:mmmmZ timestamp to YYYY/MM/DD HH:MM:SS timestamp
function Get-FormattedTime {
    param (
        [string] $Timestamp
    )

    $Date = if ($Timestamp -match "\d{4}-\d{2}-\d{2}") { $matches[0] } else { $null }
    $Time = if ($Timestamp -match "\d{2}:\d{2}:\d{2}") { $matches[0] } else { $null } 

    return "$Date $Time"
}


# colours the first cell of the given table's row's according to the given type
$WORK_ITEM_COLOURS = @{
    "Project"       = (Get-RGB 200 200 200)
    "Epic"          = (Get-RGB 255 225 175)
    "Feature"       = (Get-RGB 225 175 255)
    "User Story"    = (Get-RGB 175 225 255)
    "Task"          = (Get-RGB 255 245 175)
}

function Set-RowColourByType {
    param (
        [object] $Table,
        [int] $Row,
        [int] $Column,
        [string] $Type
    )

    $Colour = $WORK_ITEM_COLOURS[$Type];

    if ($null -eq $Colour) {
        $Colour = Get-RGB 235 235 235
    }

    $Table.cell($Row, $Column).shading.BackgroundPatternColor = $Colour;
}



### [[ Set Up ]] ###

$ErrorActionPreference = "Stop" # stops at first error

Write-Host "Starting extraction..."

# required project details
$Organisation = "MuhammadsOrganisation"
$Project = "CS Project II"
$PAT = "98rROIHKSIsDFw4pwwPEvtqgVMow5IS30QvNeb7syr7oQ4P8fZyVJQQJ99BJACAAAAAAAAAAAAASAZDO0oxC" 
    # expires 2026/10/01

# relationships
$WorkItemRelations = Get-AllWorkItemRelations $PAT $Organisation $Project

# details
$Ids = $WorkItemRelations.workItemRelations | ForEach-Object { $_.Target.Id }
$Ids = $Ids | Select-Object -Unique

$WorkItems = Get-WorkItemsByIds $PAT $Organisation $Ids

# tree of details
$WorkItemsTree = Get-TreeFromRelationsAndWorkItems $WorkItemRelations $WorkItems

# final word document
Save-WorkItemsTreeAsWordDocument $WorkItemsTree "C:\Users\mobot\OneDrive\Desktop\Work Items Document.docx"

Write-Host "Work Items extracted and saved!"