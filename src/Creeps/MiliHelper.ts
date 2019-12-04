import { ALLY_LIST } from "Utils/Imports/internals";

export class MiliHelper {
    /**
     * check if the creep belongs to an alliance member
     * @param creep the creep we are evaluating
     */
    public static isAllyCreep(creep: Creep): boolean {
        return ALLY_LIST.includes(creep.owner.username);
    }
}
