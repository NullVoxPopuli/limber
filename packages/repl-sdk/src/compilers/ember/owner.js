/**
 * @param {unknown} [owner]
 */
export function makeOwner(owner) {
  return {
    /**
     * @param {string} name
     */
    lookup(name) {
      console.log(name, owner, owner?.lookup(name));
      if (typeof owner !== 'object') return;
      if (!owner) return;
      if (!('lookup' in owner)) return;
      if (typeof owner.lookup !== 'function') return;

      return owner.lookup(name);
    },
    /**
     * @param {string} name
     */
    resolveRegistration(name) {
      if (typeof owner !== 'object') return;
      if (!owner) return;
      if (!('resolveRegistration' in owner)) return;
      if (typeof owner.resolveRegistration !== 'function') return;

      return owner.resolveRegistration(name);
    },
  };
}
