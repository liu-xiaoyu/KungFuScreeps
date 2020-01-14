// keep
// This will handle automatic construction site placement for the room
// Will have its own manager, however the manager will be called via room manager
// Open to feedback on how to tackle this, just want to introduce the idea
// Planning on handling dependent rooms and owned rooms seperately
// This will allow us to seperate the construction for each structure type into different functions
// Think of how room visuals is set up in different boxes... like that

export class AutoConstruction {
    /**
     * Create an array that contains true or false if a tile is buildable
     * @param roomName The name of the room to get buildable tiles
     * @returns Array[] A 2-d array of booleans, true if tile is buildable
     */
    public static getBuildableTiles(roomName: string): boolean[][] {
        // TODO Create a stringify/unstringify version of this array to be stored in memory
        const roomTerrain: RoomTerrain = new Room.Terrain(roomName);
        // Create an empty 50 x 50 array
        // For clarity, creates an Array from [ a new array of 50 elements ] and maps each element to [ a new array of 50 elements ]
        // This array will be filled with booleans of buildable or not
        const buildableArray: boolean[][] = Array.from(Array(50), () => new Array(50));

        // Fill buildableArray
        for (let x = 0; x < 50; x++) {
            for (let y = 0; y < 50; y++) {
                // Skip outside tiles/exit tiles
                if (x === 49 || x === 0 || y === 49 || y === 0) {
                    buildableArray[x][y] = false;
                    continue;
                }
                // Position is true if it is not a wall
                buildableArray[x][y] = roomTerrain.get(x, y) !== TERRAIN_MASK_WALL;
            }
        }
        return buildableArray;
    }

    /**
     * Get the distance transofmr of the room array
     * @param roomName the room name we are checking this all for
     * @returns number[][] representing distance transform array
     */
    private static getDistanceTransformOfRoom(roomName: string): number[][] {
        const buildableArray: boolean[][] = this.getBuildableTiles(roomName);
        const distanceTransform: number[][] = Array.from(Array(50), () => new Array(50));

        for (let x = 0; x < 50; x++) {
            for (let y = 0; y < 50; y++) {

            }
        }
        return distanceTransform;
    }

    /**
     * Returns the top left tile of a buildable location, given the params
     * @param height The height of the module (y range)
     * @param width The width of the module (x range)
     * @returns RoomPosition The top left position of where the module can be placed
     */
    public static getOptimalLocation(roomName: string, height: number, width: number): RoomPosition | undefined {
        const distanceTransform: number[][] = this.getDistanceTransformOfRoom(roomName);


    }

    /**
     * Check the squares around the current location
     * @param x the x value
     * @param y the y value
     * @param distanceTransform the array representing closest distance to each tile
     * @returns boolean representing if the location is suitable
     */
    private static checkCurrentLocation(x: number, y: number, distanceTransform: number[][]): boolean {

    }

    /**
     * Returns the number of available constructionSites out of the current cap
     * @returns number
     */
    public static remainingConstSites(): number {
        // Game Given Constant - Number of sites
        return MAX_CONSTRUCTION_SITES - Object.keys(Game.constructionSites).length;
    }
}
