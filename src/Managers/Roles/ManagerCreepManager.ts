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

        if (creep.carry.energy === 0) {
            return this.getEnergyJob(creep, room);
        }
        else {
            return this.getCarryJob(creep, room);
        }
    }

    /**
     * Find a job to get energy for the manager
     * @param creep the manager creep we are running
     * @param room the room the creep is in
     */
    private getEnergyJob(creep: Creep, room: Room): BaseJob | undefined {
        // Make sure we aren't getting energy just to put it right back into the storage
        // Prefer terminal first, then storage if we must
        // Probably check getCarryJob to see if a job BESIDES putting back in storage exists
        // since i guess that will be default job for manager?, and if so continue, otherwise skip the tick?
    }

    /**
     * Get a carry part job for the manager
     * @param creep the manager creep we are running
     * @param room the room the creep is in
     */
    private getCarryJob(creep: Creep, room: Room): CarryPartJob | undefined {
        // Make sure the carry part job target is within range: 1
        // Make sure its in the right order (spawns, towers, links, nukes, storage)
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
