import { ROLE_REMOTE_RESERVER, MemoryApi, CreepAllApi } from "Utils/Imports/internals";

// Manager for the miner creep role
export class RemoteReserverCreepManager implements ICivCreepRoleManager {
    public name: RoleConstant = ROLE_REMOTE_RESERVER;

    constructor() {
        const self = this;
        self.getNewJob = self.getNewJob.bind(this);
        self.handleNewJob = self.handleNewJob.bind(this);
    }

    /**
     * Find a job for the creep
     * @param creep the creep we are finding the job for
     * @param room the home room of the creep
     */
    public getNewJob(creep: Creep, room: Room): ClaimPartJob | undefined {
        const creepOptions: CreepOptionsCiv = creep.memory.options as CreepOptionsCiv;

        if (creepOptions.claim) {
            const reserveJob = MemoryApi.getReserveJobs(room,
                (sjob: ClaimPartJob) => !sjob.isTaken && sjob.targetID === creep.memory.targetRoom);
            if (reserveJob.length > 0) {
                return reserveJob[0];
            }
        }
        return undefined;
    }

    /**
     * Handle initalizing a new job
     */
    public handleNewJob(creep: Creep, room: Room): void {
        MemoryApi.updateJobMemory(creep, room);
    }
}
