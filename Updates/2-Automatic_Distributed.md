## Automatic_Scanning

While it is a mechanic of the game, constantly **connecting**, **opening ports**, **nuking**, **copying scripts**, and **running the scripts with the right amount of threads** can get quite tedious pretty quickly. So instead, I want a script that will go in there, hack devices automatically for me, and run the maximum number of scripts on them. The first thing I realized is that scripts are limited by the number of API function calls found within the source code as that is what determines how much "RAM" is used by the server. So to make the main script more efficent, we'll need some supporting scripts to get preliminary information and use that information in our main script.

One of the first pieces of information we'll need is a list of all servers on our network that we can hack. I went ahead and made a script that does that with a makeshift queue and set showing a list of devices to scan from and servers we have already visited. It will perform a breadth-first-search to map out the entire network graph and print out what devices it found from the set. We are using ns.tprint() here to print it out to us so we can copy and paste the output into our main function. The resulting script came out to 1.8 GB of RAM, which is 1.8 GB of RAM we'll be saving from here on out.

**auto_scan.js**
```js
/** @param {NS} ns */

/*
The purpose of this script is to be ran on the host server and it will print out
an array to terminal containing all of the hosts it could scan for
*/

export async function main(ns) {
  var visited = ["home"];
  
  var toVisit = ns.scan("home");

  while (toVisit.length > 0) {

    //gets the next host to scan from
    var hostname = toVisit.shift();
    if (visited.includes(hostname)) {
      continue;
    }

    visited.push(hostname); //keeps record that we did visit this node
    
    // scans adjacent nodes
    let adjacentNodes = ns.scan(hostname);
    for (const node of adjacentNodes) {
      if (!visited.includes(node)) {
        toVisit.push(node)
      }
    } 
  }

  ns.tprint(visited); //here is our final product

}
```

Here is the result:

```
[home /]> run auto-scan.js 
Running script with 1 thread, pid 12 and args: [].
auto-scan.js: ["home","n00dles","foodnstuff","sigma-cosmetics","joesguns","hong-fang-tea","harakiri-sushi","iron-gym","pserv-0","pserv-1","max-hardware","CSEC","zer0","nectar-net","phantasy","neo-net","omega-net","silver-helix","netlink","avmnite-02h","the-hub","computek","johnson-ortho","crush-fitness","zb-institute","rothman-uni","summit-uni","syscore","catalyst","I.I.I.I","millenium-fitness","lexo-corp","rho-construction","aevum-police","alpha-ent","galactic-cyber","global-pharm","aerocorp","snap-fitness","omnia","unitalife","deltaone","univ-energy","solaris","icarus","defcomm","zeus-med","infocomm","nova-med","zb-def","taiyang-digital","titan-labs","microdyne","run4theh111z","applied-energetics","vitalife","fulcrumtech","helios","stormtech","4sigma",".","omnitek","kuai-gong","blade","nwo","powerhouse-fitness","b-and-a","clarkinc","megacorp","ecorp","fulcrumassets","The-Cave"]
[home /]> 
```

## Automatic_Hacking
Now that we have a list of targets, I want to go in there and create a script that will hack as many devices as possible. We currently have 2 port opening programs, so we'll call those for every host we encounter. I also included some verbosity with the logging of successful devices we have root over.

**auto_nuker.js**
```js
/** @param {NS} ns */

export async function main(ns) {
  //copied from the terminal
  const targets = ["home","n00dles","foodnstuff","sigma-cosmetics","joesguns","hong-fang-tea","harakiri-sushi","iron-gym","pserv-0","pserv-1","max-hardware","CSEC","zer0","nectar-net","phantasy","neo-net","omega-net","silver-helix","netlink","avmnite-02h","the-hub","computek","johnson-ortho","crush-fitness","zb-institute","rothman-uni","summit-uni","syscore","catalyst","I.I.I.I","millenium-fitness","lexo-corp","rho-construction","aevum-police","alpha-ent","galactic-cyber","global-pharm","aerocorp","snap-fitness","omnia","unitalife","deltaone","univ-energy","solaris","icarus","defcomm","zeus-med","infocomm","nova-med","zb-def","taiyang-digital","titan-labs","microdyne","run4theh111z","applied-energetics","vitalife","fulcrumtech","helios","stormtech","4sigma",".","omnitek","kuai-gong","blade","nwo","powerhouse-fitness","b-and-a","clarkinc","megacorp","ecorp","fulcrumassets","The-Cave"]

  var success = []
  for (const hostname of targets) {
    ns.brutessh(hostname);
    ns.ftpcrack(hostname);
    if (ns.getServerNumPortsRequired(hostname) < 3) {
      ns.nuke(hostname);
      success.push(hostname); //keeps record of successful hacks
    }
  }

  //prints out the devices we hacked
  ns.tprint(success);
}
```

Result:
```
[home /]> run auto_nuker.js 
Running script with 1 thread, pid 16 and args: [].
auto_nuker.js: ["n00dles","foodnstuff","sigma-cosmetics","joesguns","hong-fang-tea","harakiri-sushi","iron-gym","max-hardware","CSEC","zer0","nectar-net","phantasy","neo-net","omega-net","silver-helix","avmnite-02h","the-hub","johnson-ortho","crush-fitness"]
[home /]> 
```

## Automatic_Distribution

Now our goal is to take all of our hacked devices and run as many of the self-hacking script as we can. We did this by copying the self-hacking script to every device, finding how many threads we could run with the limited RAM. And ran the script on each device hacking itself. There were a couple issues as we needed to make sure it was a RAM-less server and that we had a high enough hacking level to hack the system.

**auto_distributed.js**
```js
/** @param {NS} ns */

export async function main(ns) {

  //pulled from our auto_hacker
  var hacked = ["n00dles", "foodnstuff", "sigma-cosmetics", "joesguns", "hong-fang-tea", "harakiri-sushi", "iron-gym", "max-hardware", "CSEC", "zer0", "nectar-net", "phantasy", "neo-net", "omega-net", "silver-helix", "avmnite-02h", "the-hub", "johnson-ortho", "crush-fitness"];

  for (const hostname of hacked) {
    ns.killall(hostname) //makes sure we are starting fresh on each server
    ns.scp("self-hack-template.js", hostname);

    //determines how many threads will be ran on each server
    let amountRam = ns.getServerMaxRam(hostname);
    let scriptRam = ns.getScriptRam("self-hack-template.js");
    let numOfThreads = Math.floor(amountRam / scriptRam);

    //makes sure there is at least one thread and we have enough hacking level to actually hack the device
    //if not, skips it
    if (numOfThreads > 0 && ns.getServerRequiredHackingLevel(hostname) <= ns.getHackingLevel()) {
      ns.exec("self-hack-template.js", hostname, numOfThreads, hostname);
    } else {
      continue;
    }
  }

}
```

##Putting it all together

One thing I realized is if you were to add up all of the RAM from these three scripts. It would only result in 7.95 GB of RAM. I realized since it is a one shot script, I could combine all three of them into one code and simply run that and it would stay under my 8 GB of RAM on my home system. Anyways, here is our automatic distributed of our hacking software onto the bitburner network.

**auto_distributer.js**
```js
/** @param {NS} ns */

export async function main(ns) {

  var visited = ["home"];

  var toVisit = ns.scan("home");

  while (toVisit.length > 0) {

    //gets the next host to scan from
    let hostname = toVisit.shift();
    if (visited.includes(hostname)) {
      continue;
    }

    visited.push(hostname); //keeps record that we did visit this node

    // scans adjacent nodes
    let adjacentNodes = ns.scan(hostname);
    for (const node of adjacentNodes) {
      if (!visited.includes(node)) {
        toVisit.push(node)
      }
    }
  }

  //goes through and nukes all the devices we found
  var hacked = []
  for (const hostname of visited) {
    ns.brutessh(hostname);
    ns.ftpcrack(hostname);
    if (ns.getServerNumPortsRequired(hostname) < 3) {
      ns.nuke(hostname);
      hacked.push(hostname); //keeps record of devices we have root access to
    }
  }


  for (const hostname of hacked) {
    ns.killall(hostname) //makes sure we are starting fresh on each server
    ns.scp("self-hack-template.js", hostname);

    //determines how many threads will be ran on each server
    let amountRam = ns.getServerMaxRam(hostname);
    let scriptRam = ns.getScriptRam("self-hack-template.js");
    let numOfThreads = Math.floor(amountRam / scriptRam);

    //makes sure there is at least one thread and we have enough hacking level to actually hack the device
    //if not, skips it
    if (numOfThreads > 0 && ns.getServerRequiredHackingLevel(hostname) <= ns.getHackingLevel()) {
      ns.exec("self-hack-template.js", hostname, numOfThreads, hostname);
    } else {
      continue;
    }
  }

}
```
