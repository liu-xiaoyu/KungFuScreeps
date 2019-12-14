import { CreepAllApi, MemoryApi_Jobs, UserException, ROLE_CLAIMER } from "Utils/Imports/internals";

// Manager for the miner creep role
export class ClaimerCreepManager implements ICivCreepRoleManager {
    public name: RoleConstant = ROLE_CLAIMER;

    constructor() {
        const self = this;
        self.getNewJob = self.getNewJob.bind(this);
        self.handleNewJob = self.handleNewJob.bind(this);
    }

    public getNewJob(creep: Creep, room: Room): ClaimPartJob | undefined {
        const creepOptions = creep.memory.options as CreepOptionsCiv;

        if (creepOptions.claim) {
            const claimJobs = MemoryApi_Jobs.getClaimJobs(room, (job: ClaimPartJob) => !job.isTaken);

            if (claimJobs.length > 0) {
                return claimJobs[0];
            }
        }

        return undefined;
    }

    public handleNewJob(creep: Creep, room: Room, job?: BaseJob): void {
        const newJob = MemoryApi_Jobs.searchClaimPartJobs(job as ClaimPartJob, room);

        if (newJob === undefined) {
            const exception = new UserException(
                "Invalid Job For RemoteReserver",
                "Creep: " + creep.name + "\nJob: " + JSON.stringify(creep.memory.job),
                ERROR_WARN
            );

            delete creep.memory.job;

            throw exception;
        } else {
            newJob.isTaken = true;
        }
    }
}
