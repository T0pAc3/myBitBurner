/** @param {NS} ns */
export async function main(ns) {

  let neighbors = ns.scan();
  const target = ns.getHostname();

  for (let neighbor of neighbors) {
    if (ns.hasRootAccess(neighbors[0])) {
      neighbors.shift();
    } else {
      break;
    }
  }

  while (true) {

    if (neighbors.length > 0 &&
        ns.getServerRequiredHackingLevel(neighbors[0]) <= ns.getHackingLevel()) {
          ns.nuke(neighbors[0]);
          ns.scp("zombie.js", neighbors[0]);
          ns.exec("zombie.js", neighbors[0]);
          neighbors.shift();
    }

    if (ns.getServerSecurityLevel(target) > ns.getServerMinSecurityLevel(target)) {
      await ns.weaken(target);
    }
    else if (ns.getServerMoneyAvailable < ns.getServerMaxMoney(target)) {
      await ns.grow(target);
    }
    else {
      await ns.hack(target);
    }

  }
}
