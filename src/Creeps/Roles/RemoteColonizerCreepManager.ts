import { ROLE_COLONIZER } from "Utils/Imports/internals";

// Manager for the miner creep role
export class RemoteColonizerCreepManager implements ICivCreepRoleManager {
    public name: RoleConstant = ROLE_COLONIZER;

    constructor() {
        const self = this;
        self.getNewJob = self.getNewJob.bind(this);
        self.handleNewJob = self.handleNewJob.bind(this);
    }

    /**
     * get a job for the miner creep
     * @param creep
     * @param room
     */
    public getNewJob(creep: Creep, room: Room): BaseJob | undefined {
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

    /**
     * run the remote colonizer creep
     * @param creep the creep we are running
     */
    public runCreepRole(creep: Creep): void {
        // keep
    }
}
