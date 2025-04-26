Hooks.on("midi-qol.AttackRollComplete", async (workflow) => {
    const actor = workflow.actor;
    const item = workflow.item;
    const hitTargets = [...workflow.hitTargets];
    const allTargets = [...workflow.targets];

    const combat = game.combat;
    const currentCombatant = combat?.combatant;
    // Make sure it's this user's turn (they control the token whose turn it is)
    const isMyTurn = currentCombatant?.actor?.id === actor.id;

    if (!isMyTurn) return;
  
    let message = '';

    setTimeout(() => { 
        new Dialog({
            title: "Attack Resolved",
            content: message,
            buttons: {
              nextTurn: {
                label: "Next Turn",
                callback: async () => {
                    console.log("Next Turn button clicked!");
                    await socketlib.modules.get("surreal-combat-enhancements").executeAsGM("advanceTurn");
                }
              }
            }
          }).render(true);
     }, 5000);

  });
  
  Hooks.on("createCombat", async (combat, options, userId) => {
  
    // Wait for combatants to be fully added
    await new Promise(resolve => setTimeout(resolve, 100));
  
    const ids = combat.combatants.map(c => c.id);
    await combat.rollInitiative(ids);
    
    // Start combat (this sets the first turn)
    await combat.startCombat();
  });
  
  Hooks.once("socketlib.ready", () => {
    console.log("[Surreal Combat] socketlib.ready fired");
    const socket = socketlib.registerModule("surreal-combat-enhancements");
    socket.register("advanceTurn", async () => {
        console.log("🛎️ [Surreal Combat] GM received 'advanceTurn' socket call");
      
        const combat = game.combat;
        if (!combat) return console.warn("⚠️ No active combat.");
        if (combat.combatants.length === 0) return console.warn("⚠️ No combatants in combat.");
      
        await combat.nextTurn();
        console.log(`✅ [Surreal Combat] Turn advanced.`);
      });

});