// manages instances of Track objects
// * a Track is a collection of nodes, data, and other objects which define it

import PathNode from "../geometry/path-node.js";
import TrackNode from "./components/track-node.js";
import Material from "./components/material.js";
import Obstacle from "./components/obstacle.js";
import Decoration from "./components/decoration.js";
import Validator from "../../utilities/validator.js";


export default class Track {
    #_id;           // string

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
        this.setName("New Track");
        this.setDescription("This is a new track");
        this.setAuthorId("0");
        this.setAuthor("n/a");
        this.setTags([]);

        this.setPath([]);
        this.setMaterials([]);
        this.setObstacles([]);
        this.setDecorations([]);
        
        this.setLooped(true);
    }


    // getters / setters
    getId() { return this.#_id; }    
    setId(id) { this.#_id = id; }


    getName() { return this.#name; }
    setName(name) {
        Validator.isPrimitive(name, "string");
        this.#name = name;
    }

    getDescription() { return this.#description; }
    setDescription(description) {
        Validator.isPrimitive(description, "string");
        this.#description = description; 
    }

    getAuthorId() { return this.#authorId; }
    setAuthorId(id) {
        Validator.isPrimitive(id, "string");
        this.#authorId = id;
    }

    getAuthor() { return this.#author; }
    setAuthor(author) {
        Validator.isPrimitive(author, "string");
        this.#author = author;
    }

    getTags() { return this.#tags; }
    setTags(tags) {
        Validator.isPrimitiveList(tags, "string");
        this.#tags = tags;
    }


    getPath() { return this.#path; }
    setPath(path) {
        Validator.isInstanceList(path, TrackNode);
        this.#path = path;
    }

    getMaterials() { return this.#materials; }
    setMaterials(materials) {
        Validator.isInstanceList(materials, Material);
        this.#materials = materials; 
    }

    getObstacles() { return this.#obstacles; }
    setObstacles(obstacles) {
        Validator.isInstanceList(obstacles, Obstacle);
        this.#obstacles = obstacles;
    }

    getDecorations() { return this.#decorations; }
    setDecorations(decorations) {
        Validator.isInstanceList(decorations, Decoration);
        this.#decorations = decorations;
    }

    isLooped() { return this.#looped; }
    setLooped(looped) {
        Validator.isPrimitive(looped, "boolean");
        this.#looped = looped;
    }


    // node methods
    getSize() {
        return this.#path.length;
    }

    getNode(index) {
        Validator.inListBounds(this.#path, index);
        return this.#path[index];
    }

    getNodeIndex(node) {
        return Validator.listPresence(this.#path, node);
    }

    getNodeBefore(node) {
        let index = Validator.listPresence(this.#path, node);
        index = (index - 1) < 0 ? this.getSize() - 1 : index - 1;
        return this.#path[index];
    }

    getNodeAfter(node) {
        let index = Validator.listPresence(this.#path, node);
        index = (index + 1) % this.getSize();
        return this.#path[index];
    }

    addNode(node) {
        Validator.isInstance(node, TrackNode);
        Validator.listAbsence(this.#path, node);
        this.#path.push(node);
    }

    addNodeAtIndex(node, index) {
        this.#path = this.#path.toSpliced(index, 0, node);
    }

    removeNode(node) {
        let index = Validator.listPresence(this.#path, node);
        this.#path.splice(index, 1);
    }

    // generic polygon methods
    getPolygons() {
        return this.#materials.concat(this.#obstacles, this.#decorations);
    }

    // material methods
    addMaterial(material) {
        Validator.isInstance(material, Material);
        Validator.listAbsence(this.#materials, material);
        this.#materials.push(material);
    }

    removeMaterial(material) {
        let index = Validator.listPresence(this.#materials, material);
        this.#materials.splice(index, 1);
    }

    // obstacle methods
    addObstacle(obstacle) {
        Validator.isInstance(obstacle, Obstacle);
        Validator.listAbsence(this.#obstacles, obstacle);
        this.#obstacles.push(obstacle);
    }

    removeObstacle(obstacle) {
        let index = Validator.listPresence(this.#obstacles, obstacle);
        this.#obstacles.splice(index, 1);
    }

    // decoration methods
    addDecoration(decoration) {
        Validator.isInstance(decoration, Decoration);
        Validator.listAbsence(this.#decorations, decoration);
        this.#decorations.push(decoration);
    }

    removeDecoration(decoration) {
        let index = Validator.listPresence(this.#decorations, decoration);
        this.#decorations.splice(index, 1);
    }

    
    // serialisation
    toObject() {
        return {
            _id: this.#_id,

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

        track.#_id = object._id;

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

    toJson(spaces) {
        return JSON.stringify(this.toObject(), null, spaces);
    }
}