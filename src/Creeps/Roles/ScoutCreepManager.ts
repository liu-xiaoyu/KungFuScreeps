import { ROLE_SCOUT, CreepApi } from "Utils/Imports/internals";

export class ScoutCreepManager implements ICivCreepRoleManager {
    public name: RoleConstant = ROLE_SCOUT;

    constructor() {
        const self = this;
        self.getNewJob = self.getNewJob.bind(this);
        self.handleNewJob = self.handleNewJob.bind(this);
    }

    /**
     * Get a MovePartJob for the scout - Should never be undefined
     * @param creep the creep we are looking for
     */
    public getNewJob(creep: Creep): MovePartJob {
        const newJob: MovePartJob = {
            jobType: "movePartJob",
            targetType: "roomName",
            targetID: creep.memory.targetRoom,
            actionType: "move",
            isTaken: false
        };

        return newJob;
    }

    /**
     * Handle initalizing a new job
     * @param creep the creep we are using
     * @param room the room we are in
     */
    public handleNewJob(creep: Creep, room: Room): void {
        // Handle new job here
        // Scout currently does not use this, might in the future
    }
}
