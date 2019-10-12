import { ROLE_MANAGER, MemoryApi, CreepApi } from "utils/internals";

// Manager for the miner creep role
export class ManagerCreepManager implements ICivCreepRoleManager {
    public name: RoleConstant = ROLE_MANAGER;

    constructor() {
        const self = this;
        self.getNewJob = self.getNewJob.bind(this);
        self.handleNewJob = self.handleNewJob.bind(this);
    }

    /**
     * Decides which kind of job to get and calls the appropriate function
     * @param creep the creep we are getting the job for
     * @param room the room we are in
     * @returns BaseJob of the new job we recieved (undefined if none)
     */
    public getNewJob(creep: Creep, room: Room): BaseJob | undefined {
        // get a new job
        // TODO
        return {
            jobType: "workPartJob",
            targetID: "3939301",
            targetType: "constructedWall",
            actionType: "repair",
            isTaken: false
        };
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
}
