// Data-driven, deterministic branching dialogue engine; no UI coupling.
window.VHDialogueEngine = (() => {
  const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
  function allowed(condition = {}, context = {}) {
    const flags = context.flags || {};
    const evidence = context.evidence || [];
    if (condition.allFlags && !condition.allFlags.every(key => flags[key] === true)) return false;
    if (condition.noFlags && !condition.noFlags.every(key => !flags[key])) return false;
    if (condition.anyFlags && !condition.anyFlags.some(key => flags[key] === true)) return false;
    if (condition.evidence && !condition.evidence.every(id => evidence.includes(id))) return false;
    return true;
  }
  function availableChoices(node, context) {
    return (node.choices || []).filter(choice => allowed(choice.when, context));
  }
  function applyEffects(context, effects = {}) {
    const next = { ...context, flags: { ...(context.flags || {}) }, evidence: [...(context.evidence || [])] };
    for (const key of effects.flags || []) next.flags[key] = true;
    for (const key of effects.clearFlags || []) delete next.flags[key];
    for (const id of effects.evidence || []) if (!next.evidence.includes(id)) next.evidence.push(id);
    return next;
  }
  function start(nodes, startId, context = {}) {
    if (!hasOwn(nodes, startId)) throw Error('Missing dialogue node: ' + startId);
    return { nodeId: startId, context: applyEffects(context), history: [] };
  }
  function choose(nodes, session, choiceId) {
    const node = nodes[session.nodeId];
    if (!node) throw Error('Missing dialogue node: ' + session.nodeId);
    const choice = availableChoices(node, session.context).find(item => item.id === choiceId);
    if (!choice) throw Error('Unavailable dialogue choice: ' + choiceId);
    if (!hasOwn(nodes, choice.next)) throw Error('Missing dialogue destination: ' + choice.next);
    return {
      nodeId: choice.next,
      context: applyEffects(session.context, choice.effects),
      history: [...session.history, { nodeId: session.nodeId, choiceId }]
    };
  }
  function advance(nodes, session) {
    const node = nodes[session.nodeId];
    if (!node || !node.next || !hasOwn(nodes, node.next)) throw Error('No valid automatic next node');
    return { ...session, nodeId: node.next, history: [...session.history, { nodeId: session.nodeId, next: node.next }] };
  }
  function validate(nodes) {
    const issues = [];
    for (const [key, node] of Object.entries(nodes)) {
      if (node.id !== key) issues.push('ID mismatch: ' + key);
      const seen = new Set();
      for (const choice of node.choices || []) {
        if (seen.has(choice.id)) issues.push('Duplicate choice: ' + key + '/' + choice.id);
        seen.add(choice.id);
        if (!hasOwn(nodes, choice.next)) issues.push('Broken choice: ' + key + ' -> ' + choice.next);
      }
      if (node.next && !hasOwn(nodes, node.next)) issues.push('Broken next: ' + key + ' -> ' + node.next);
    }
    return issues;
  }
  return { allowed, availableChoices, applyEffects, start, choose, advance, validate };
})();
