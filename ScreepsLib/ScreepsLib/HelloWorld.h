#ifndef HELLOWORLD_H
#define HELLOWORLD_H

#include <iostream>
#include <string>

using namespace std;

namespace ScreepsLib
{
  class HelloWorld {
  public:
    // returns "Hello World"
    static string sayHello();
    static string sayHello(string name);
  };
}

#endif
