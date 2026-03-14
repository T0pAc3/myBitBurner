## Tutorial
To begin with, I read through the tutorial documentation and created two seperate scripts to run. First off, I found a self-hack script that will go through and continously weaken the security on the host system running the script until it reaches it's weakest, then it will grow the amount of money the server has until it is its largest amount. And then hack it until it is dry of all the money.

*self-hack-template.js*
```js
/** @param {NS} ns */
export async function main(ns) {

  const target = ns.args[0];

  // Defines how much money a server should have before we hack it
  // In this case, it is set to the maximum amount of money.
  const moneyThresh = ns.getServerMaxMoney(target);

  // Defines the minimum security level the target server can
  // have. If the target's security level is higher than this,
  // we'll weaken it before doing anything else
  const securityThresh = ns.getServerMinSecurityLevel(target);

  // Infinite loop that continously hacks/grows/weakens the target server
  while (true) {
    if (ns.getServerSecurityLevel(target) > securityThresh) {
      // If the server's security level is above our threshold, weaken it
      await ns.weaken(target);
    } else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
      // If the server's money is less than our threshold, grow it
      await ns.grow(target);
    } else {
      // Otherwise, hack it
      await ns.hack(target);
    }
  }
}
```

Then I also found a script that will go and purchase more servers that we can use to hack other devices. It will purchase the servers whenever we have enough money.

*purchase-servers.js*
```js
/** @param {NS} ns */
export async function main(ns) {
    // How much RAM each purchased server will have. In this case, it'll
    // be 8GB.
    const ram = 8;

    // Iterator we'll use for our loop
    let i = 0;

    // Continuously try to purchase servers until we've reached the maximum
    // amount of servers
    while (i < ns.getPurchasedServerLimit()) {
        // Check if we have enough money to purchase a server
        if (ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(ram)) {
            // If we have enough money, then:
            //  1. Purchase the server
            //  2. Copy our hacking script onto the newly-purchased server
            //  3. Run our hacking script on the newly-purchased server with 3 threads
            //  4. Increment our iterator to indicate that we've bought a new server
            let hostname = ns.purchaseServer("pserv-" + i, ram);
            ns.scp("self-hack-template.js", hostname);
            ns.exec("self-hack-template.js", hostname, 3, "foodnstuff");
            ++i;
        }
        //Make the script wait for a second before looping again.
        //Removing this line will cause an infinite loop and crash the game.
        await ns.sleep(1000);
    }
}
```

My current focus is improving my hack skill and also finding a way to go around and hack more devices automatically. I'll have a solution for that in my next update.
