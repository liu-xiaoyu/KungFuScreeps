import {
    GROUPED,
    ROOM_STATE_INTRO,
    ROOM_STATE_BEGINNER,
    ROOM_STATE_INTER,
    ROOM_STATE_ADVANCED,
    ROOM_STATE_NUKE_INBOUND,
    ROOM_STATE_STIMULATE,
    ROOM_STATE_UPGRADER,
    TIER_1,
    TIER_2,
    TIER_3,
    TIER_4,
    TIER_5,
    TIER_6,
    TIER_7,
    TIER_8,
    ROLE_TOWER_TANK,
} from "utils/Constants";
import { SpawnHelper } from "Helpers/SpawnHelper";
import SpawnApi from "Api/Spawn.Api"

export class TowerDrainerTankBodyOptsHelper implements ICreepBodyOptsHelper {

    public name: RoleConstant = ROLE_TOWER_TANK;

    constructor() {
        const self = this;
        self.generateCreepBody = self.generateCreepBody.bind(self);
        self.generateCreepOptions = self.generateCreepOptions.bind(this);
    }

    /**
     * Generate body for zealot creep
     * @param tier the tier of the room
     */
    public generateCreepBody(tier: TierConstant): BodyPartConstant[] {
        // Default Values for Zealot
        let body: CreepBodyDescriptor = { work: 0, move: 0 };
        const opts: CreepBodyOptions = { mixType: GROUPED };

        switch (tier) {

            case TIER_8:
            case TIER_7:
            case TIER_6:
            case TIER_5:
            case TIER_4: // Total Cost: 1300
                body = { tough: 30, move: 20 };
                break;
        }

        // ! Important DONT FORGET TO CHANGE
        // Temp override
        // body = { attack: 1, move: 1 };
        // Generate creep body based on body array and options
        return SpawnApi.createCreepBody(body, opts);
    }

    /**
     * Generate options for zealot creep
     * @param roomState the room state of the room
     * @param squadSizeParam the size of the squad associated with the zealot
     * @param squadUUIDParam the squad id that the zealot is a member of
     * @param rallyLocationParam the meeting place for the squad
     */
    public generateCreepOptions(
        roomState: RoomStateConstant,
        squadSizeParam: number,
        squadUUIDParam: number | null,
        rallyLocationParam: RoomPosition | null
    ): CreepOptionsMili | undefined {

        let creepOptions: CreepOptionsMili = SpawnHelper.getDefaultCreepOptionsMili();
        switch (roomState) {
            case ROOM_STATE_INTRO:
            case ROOM_STATE_BEGINNER:
            case ROOM_STATE_INTER:
            case ROOM_STATE_ADVANCED:
            case ROOM_STATE_STIMULATE:
            case ROOM_STATE_UPGRADER:
            case ROOM_STATE_NUKE_INBOUND:
                creepOptions = {
                    squadSize: squadSizeParam,
                    squadUUID: squadUUIDParam,
                    rallyLocation: rallyLocationParam,
                    rallyDone: false,
                };

                break;
        }

        return creepOptions;
    }
}
