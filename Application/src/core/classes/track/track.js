// manages instances of Track objects
// * a Track is a collection of nodes, data, and other objects which define it

import PathNode from "../geometry/path-node.js";
import TrackNode from "./components/track-node.js";
import Material from "./components/material.js";
import Obstacle from "./components/obstacle.js";
import Decoration from "./components/decoration.js";


export default class Track {
    #trackId;       // int

    #name;          // string
    #description;   // string
    #authorId;      // int
    #author;        // string
    #tags;          // string[]
    
    #path;          // TrackNode[]
    #materials;     // Polygon[]
    #obstacles;     // Polygon[]
    #decorations;   // Polygon[]
    
    #looped;        // boolean

    constructor() {
        this.#trackId = 0;

        this.#name = "New Track";
        this.#description = "This is a new track";
        this.#authorId = 0;
        this.#author = "n/a";
        this.#tags = [];

        this.#path = [];
        this.#materials = [];
        this.#obstacles = [];
        this.#decorations = [];
        
        this.#looped = true;
    }


    // getters / setters
    getTrackId() { return this.#trackId; }    
    setTrackId(id) { this.#trackId = id; }


    getName() { return this.#name; }
    setName(name) { this.#name = name; }

    getDescription() { return this.#description; }
    setDescription(description) { this.#description = description; }

    getAuthorId() { return this.#authorId; }
    setAuthorId(id) { this.#authorId = id; }

    getAuthor() { return this.#author; }
    setAuthor(author) { this.#author = author; }

    getTags() { return this.#tags; }
    setTags(tags) { this.#tags = tags; }


    getPath() { return this.#path; }
    setPath(path) { this.#path = path; }

    getMaterials() { return this.#materials; }
    setMaterials(materials) { this.#materials = materials; }

    getObstacles() { return this.#obstacles; }
    setObstacles(obstacles) { this.#obstacles = obstacles; }

    getDecorations() { return this.#decorations; }
    setDecorations(decorations) { this.#decorations = decorations; }

    isLooped() { return this.#looped; }
    setLooped(looped) { this.#looped = looped; }


    // node methods
    getSize() {
        return this.#path.length;
    }

    getNode(index) {
        this.#validateIndexInBounds(index);
        return this.#path[index];
    }

    getNodeIndex(node) {
        return this.#path.findIndex((element) => element == node);
    }

    getNodeBefore(node) {
        let index = this.#validateListPresence(this.#path, node);
        index = (index - 1) < 0 ? this.getSize() - 1 : index - 1;
        return this.#path[index];
    }

    getNodeAfter(node) {
        let index = this.#validateListPresence(this.#path, node);
        index = (index + 1) % this.getSize();
        return this.#path[index];
    }

    addNode(node) {
        this.#validateIsNode(node);
        this.#validateListAbsence(this.#path, node);
        this.#path.push(node);
    }

    addNodeAtIndex(node, index) {
        this.#path = this.#path.toSpliced(index, 0, node);
    }

    removeNode(node) {
        let index = this.#validateListPresence(this.#path, node);
        this.#path.splice(index, 1);
    }

    // material methods
    addMaterial(material) {
        this.#validateIsMaterial(material);
        this.#validateListAbsence(this.#materials, material);
        this.#materials.push(material);
    }

    removeMaterial(material) {
        let index = this.#validateListPresence(this.#materials, material);
        this.#materials.splice(index, 1);
    }

    // obstacle methods
    addObstacle(obstacle) {
        this.#validateIsObstacle(obstacle);
        this.#validateListAbsence(this.#materials, obstacle);
        this.#obstacles.push(obstacle);
    }

    removeObstacle(obstacle) {
        let index = this.#validateListPresence(this.#obstacles, obstacle);
        this.#obstacles.splice(index, 1);
    }

    // decoration methods
    addDecoration(decoration) {
        this.#validateIsDecoration(decoration);
        this.#validateListAbsence(this.#decorations, decoration);
        this.#decorations.push(decoration);
    }

    removeDecoration(decoration) {
        let index = this.#validateListPresence(this.#decorations, decoration);
        this.#decorations.splice(index, 1);
    }

    
    // serialisation
    toObject() {
        return {
            trackId: this.#trackId,

            name: this.#name,
            description: this.#description,
            authorId: this.#authorId,
            author: this.#author,
            tags: this.#tags,

            path: this.#path?.map(n => n.toObject()) ?? [],
            materials: this.#materials?.map(m => m.toObject()) ?? [],
            obstacles: this.#obstacles?.map(o => o.toObject()) ?? [],
            decorations: this.#decorations?.map(d => d.toObject()) ?? [],
            
            looped: this.#looped
        };
    }

    static toInstance(object) {
        let track = new Track();

        track.#trackId = object.trackId;

        track.#name = object.name;
        track.#description = object.description;
        track.#authorId = object.authorId;
        track.#author = object.author;
        track.#tags = object.tags;

        track.#path = object.path.map(n => TrackNode.toInstance(n));
        track.#materials = object.materials.map(m => Material.toInstance(m));
        track.#obstacles = object.obstacles.map(o => Obstacle.toInstance(o));
        track.#decorations = object.decorations.map(d => Decoration.toInstance(d));

        track.#looped = object.looped;

        return track;
    }

    toJson(pretty) {
        return JSON.stringify(this.toObject(), null, pretty);
    }


    // validation
    #validateIndexInBounds(index) {
        if (index < 0 || this.getSize() <= index) {
            throw new Error(`[Track] Index "${index}" is out of bounds`);
        }
    }

    #validateIsNode(node) {
        if( !(node instanceof TrackNode) ) {
            throw new Error(`[Track] "${node}" is not a TrackNode`);
        }
    }

    #validateIsMaterial(material) {
        if( !(material instanceof Material) ) {
            throw new Error(`[Track] "${material}" is not a Material`);
        }
    }

    #validateIsObstacle(obstacle) {
        if ( !(obstacle instanceof Obstacle) ) {
            throw new Error(`[Track] "${obstacle}" is not an Obstacle`);
        }
    }

    #validateIsDecoration(decoration) {
        if ( !(decoration instanceof Decoration) ) {
            throw new Error(`[Track] "${decoration}" is not an Decoration`);
        }
    }

    #validateListPresence(list, element) {
        let index = list.findIndex((e) => e == element);
        if (index < 0) {
            throw new Error(`[Track] ${typeof element} "${element}" is not a part of the track`);
        }
        return index;
    }

    #validateListAbsence(list, element) {
        let index = list.findIndex((e) => e == element);
        if (index > -1) {
            throw new Error(`[Track] ${typeof element} "${element}" is not a part of the track`);
        }
        return index;
    }
}