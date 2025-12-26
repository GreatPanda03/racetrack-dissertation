// manages instances of Track objects
// * tracks are a collection of nodes, data, and other objects which define it

import Node from "./node.js";

export default class Track {
    #trackId;       // int

    #name;          // string
    #description;   // string
    #authorId;      // int
    #author;        // string
    #tags;          // string[]
    
    #path;          // Node[]
    #materials;     // Polygon[]
    #obstacles;     // Polygon[]
    #decorations;   // Polygon[]
    
    #looped;        // boolean

    constructor() {
        this.#trackId = 0;

        this.#name = "New Track";
        this.#description = "This is a new track";
        this.#authorId = 0
        this.#author = "n/a";
        this.#tags = ["Track"];

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


    // methods
    getNode(index) {
        return this.#path[index];
    }

    getNodeIndex(node) {
        return this.#path.findIndex(
            (element) => element == node);
    }

    getNodeBefore(node) {
        let index = getNodeIndex(node);
        let before = (index - 1 == -1) ? this.#path.length : index - 1;
        return this.#path[before];
    }

    getNodeAfter(node) {
        let index = getNodeIndex(node);
        let after = (index + 1 == this.#path.length) ? 0 : index + 1;
        return this.#path[after];
    }

    addNode(node) {
        this.#path.push(node);
    }

    addNodeAtIndex(node, index) {
        this.#path = this.#path.toSpliced(index, 0, node);
    }

    getSize() {
        return this.#path.length;
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
        }
    }

    static toTrack(object) {
        let track = new Track();

        track.#trackId = object.trackId;

        track.#name = object.name;
        track.#description = object.description;
        track.#authorId = object.authorId;
        track.#author = object.author;
        track.#tags = object.tags;

        track.#path = object.path.map(n => Node.toNode(n));
        track.#materials = object.materials; // TODO: object.path.map(p => Polygon.toPolygon(p));
        track.#obstacles = object.obstacles; // ditto
        track.#decorations = object.decorations; // ditto

        track.#looped = object.looped;

        return track;
    }

    toJson(pretty) {
        return JSON.stringify(this.toObject(), null, pretty)
    }
}