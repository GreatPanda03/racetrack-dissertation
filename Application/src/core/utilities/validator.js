// multi-purpose validator class to validate types, index bounds, etc.
//   to make validating common methods easier / less repetitive


export default class Validator {
    static isPrimitive(value, type) {
        if (typeof value !== type) {
            throw new Error(`[Validator] "${value}" is not of type "${type}"`);
        }
    }

    static isInstance(value, type) {
        if ( !(value instanceof type) ) {
            throw new Error(`[Validator] "${value.constructor.name}" is not of class "${type.name}"`);
        }
    }

    static isObject(value) {
        if ( !(value instanceof Object && value.constructor == Object) ) {
            throw new Error(`[Validator] "${value}" is not a valid Object`);
        }
    }

    static listPresence(list, item) {
        let index = list.indexOf(item);

        if (index <= -1) {
            throw new Error(`[Validator] "${item}" is not an item in list`);
        }

        return index;
    }

    static listAbsence(list, item) {
        let index = list.indexOf(item);

        if (index > -1) {
            throw new Error(`[Validator] "${item}" is already an item in list`);
        }
    }

    static keyPresence(object, key) {
        if ( !(key in object) ) {
            throw new Error(`[Validator] "${key}" is not a key in object`);
        }
    }

    static valuePresence(object, value) {
        if (!Object.values(object).find(v => v == value)) {
            throw new Error(`[Validator] "${value}" is not a value in object`);
        }
    }

    static inListBounds(list, index) {
        if (index < 0 || list.length <= index) {
            throw new Error(`[Validator] Index "${index}" is out of bounds for list`);
        }
    }

    static isPrimitiveList(list, type) {
        if (list.some(e => typeof e !== type)) {
            throw new Error(`[Validator] Item "${e}" in list is not of type "${type}"`);
        }
    }

    static isInstanceList(list, type) {
        if (list.some(e => !(e instanceof type))) {
            throw new Error(`[Validator] Item "${e}" in list is not of an instance of "${type}"`);
        }
    }

    static isDomElement(element, tag) {
        if (element == null || element.tagName != tag) {
            throw new Error(`[Validator] "${element}" is not a "${tag}" DOM element`);
        }
    }

    static listKeyValue(list, key, value) {
        let target = list.find(e => e[key] == value);

        if (!target) {
            throw new Error(`[Validator] Coudln't find element with "${key}" with value "${value}" in list`);  
        }

        return target;
    }
}