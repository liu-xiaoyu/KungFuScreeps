import { ROLE_SCOUT, CreepApi, UserException } from "utils/internals";

export class ScoutCreepManager implements ICivCreepRoleManager {
    public name: RoleConstant = ROLE_SCOUT;

    constructor() {
        const self = this;
        self.getNewJob = self.getNewJob.bind(this);
        self.handleNewJob = self.handleNewJob.bind(this);
        self.runCreepRole = self.runCreepRole.bind(this);
    }

    /**
     * get a job for the miner creep
     * @param creep
     * @param room
     */
    public getNewJob(creep: Creep): MovePartJob | undefined {
        // get the exits for this room
        const exits = Game.map.describeExits(creep.room.name);
        if (exits === null) {
            throw new UserException(
                "Error in getNewJob for Scout.",
                "describeExits returned null, so the room could not be found.",
                ERROR_ERROR
            );
        }

        // Loop through exits 
        for(const i in exits) {
            const roomName = exits[i as ExitKey];
        }
    }

    /**
     * Handle initalizing a new job
     * @param creep the creep we are using
     * @param room the room we are in
     */
    public handleNewJob(creep: Creep, room: Room): void {
        // Handle new job here
        // TODO
    }

    /**
     * Run Scout Creep
     */
    public runCreepRole(creep: Creep): void {}
}
