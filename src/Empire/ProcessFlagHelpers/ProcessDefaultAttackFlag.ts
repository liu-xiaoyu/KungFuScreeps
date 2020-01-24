import { EmpireHelper, MemoryApi_Room, MemoryApi_Empire } from "Utils/Imports/internals";

export class ProcessDefaultAttackFlag implements IFlagProcesser {
    public primaryColor: ColorConstant = COLOR_RED;
    public secondaryColor: undefined = undefined;

    constructor() {
        const self = this;
        self.processFlag = self.processFlag.bind(self);
    }

    /**
     * Process the default remote room flag
     * @param flag
     */
    public processFlag(flag: Flag): void {
        // Get the host room and set the flags memory
        const flagTypeConst: FlagTypeConstant | undefined = EmpireHelper.getFlagType(flag);
        const roomName: string = flag.pos.roomName;
        Memory.flags[flag.name].complete = true;
        Memory.flags[flag.name].processed = true;
        Memory.flags[flag.name].timePlaced = Game.time;
        Memory.flags[flag.name].flagType = flagTypeConst;
        Memory.flags[flag.name].flagName = flag.name;
        Memory.flags[flag.name].spawnProcessed = false;

        // this will simply instia
    }
}
