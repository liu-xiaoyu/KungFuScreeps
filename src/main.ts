/*
  Kung Fu Klan's Screeps Code
  Written and maintained by -
    Jakesboy2
    UhmBrock

  Starting Jan 2019
*/

// Define prototypes
import { ErrorMapper, ManagerManager } from "Utils/Imports/internals";
import { MilitaryMovement_Helper } from "Military/Military.Movement.Helper";
export const loop = ErrorMapper.wrapLoop(() => {
  ManagerManager.runManagerManager();
});
