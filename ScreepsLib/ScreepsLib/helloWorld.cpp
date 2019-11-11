#include "HelloWorld.h"

using namespace ScreepsLib;

string EMSCRIPTEN_KEEPALIVE HelloWorld::sayHello()
{
  return "Hello Big Boy";
}

string EMSCRIPTEN_KEEPALIVE HelloWorld::sayHello(string name)
{
  return "Hello" + name;
}
