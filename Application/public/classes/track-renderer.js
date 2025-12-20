// manages the renderable properties of a track

class TrackRenderer {
    #track;
    #nodesVisible; #edgesVisible; #trackVisible;
    #leftSide; #rightSide;

    constructor(track) {
        this.#track = track;
    }

    // getters / setters
    getTrack() { return this.#track; }
    getLeftSide() { return this.#leftSide; }
    getRightSide() { return this.#rightSide; }

    getNodesVisible() { return this.#nodesVisible }
    setNodesVisible(visible) { this.#nodesVisible = visible }

    getEdgesVisible() { return this.#edgesVisible }
    setEdgesVisible(visible) { this.#edgesVisible = visible }

    getTrackVisible() { return this.#trackVisible }
    setTrackVisible(visible) { this.#trackVisible = visible }

    // methods

    // adds a left / right side around the given node
    addSegment(node) {
        let index = track.getNodeIndex(node);
        
    }
}
