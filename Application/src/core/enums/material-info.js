// stores information about all available materials
// * "Effect" is a method that determines how much a given offset
//     from the race car's velocity is affected, and whether it's viable

import Vector2 from "../classes/geometry/vector2.js";
// * TODO: seems smelly to include imports here...
//     but it makes sense to define the effects here too (although that's done in race instance)
// * maybe move there? leave here for now though


const MATERIAL_INFO = {
    Curb: {
        Id: 1,
        Name: "Curb",
        Description: "Limits the moves the player can make",
        Colour: "#AAA",

        Effect: (racecar, x, y) => {
            return {
                Offset: new Vector2(x, y),
                Active: (x == 0 || y == 0)
            }
        },
    },

    Gravel: {
        Id: 2,
        Name: "Gravel",
        Description: "Forces the player to slow down (acts like Curb if at 0 m/s)",
        Colour: "#777",

        Effect: (racecar, x, y) => {
            let velocity = racecar.getVelocity();
            let threshold = Math.max(1, velocity.mag());
            let offset = new Vector2(x, y);

            return {
                Offset: offset,
                Active: (velocity.add(offset)).mag() <= threshold
            }
        }
    },

    Water: {
        Id: 3,
        Name: "Water",
        Description: "Forces the player to travel at the same velocity",
        Colour: "#8BF",

        Effect: (racecar, x, y) => {
            return {
                Offset: new Vector2(x, y),
                Active: (x == 0 && y == 0)
            }
        },
    },

    Booster: {
        Id: 4,
        Name: "Booster",
        Description: "Accelerates the player in the direction of travel",
        Colour: "#8A8",

        Effect: (racecar, x, y) => {
            let velocity = racecar.getVelocity();
            let X = Math.sign(velocity.x());
            let Y = Math.sign(velocity.y());

            return {
                Offset: new Vector2(X + x, Y + y),
                Active: true
            }
        },
    }
}

export default MATERIAL_INFO;