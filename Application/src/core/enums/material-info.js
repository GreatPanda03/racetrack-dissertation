// stores information about all available materials

const MATERIAL_INFO = {
    Curb: {
        Id: 1,
        Name: "Curb",
        Description: "Limits the moves the player can make",
        Colour: "#AAA",
    },
    Gravel: {
        Id: 2,
        Name: "Gravel",
        Description: "Forces the player to slow down",
        Colour: "#777"
    },
    Water: {
        Id: 3,
        Name: "Water",
        Description: "Forces the player to travel at the same velocity",
        Colour: "#8BF"
    },
    Booster: {
        Id: 4,
        Name: "Booster",
        Description: "Accelerates the player in the direction of travel",
        Colour: "#8A8"
    }
}

export default MATERIAL_INFO;