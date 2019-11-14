const SBError = require('@shieldsbetter/sberror');

const NoSuchFactory = SBError.subtype(
        'NoSuchFactory', 'No factory called "{{name}}".');

module.exports = class {
    constructor() {
        this.factoryEntries = {};
        this.cachedSingletons = {};
    }
    
    installSingleton(name, factory) {
        installFactory(this, name, 'singleton', factory);
    }
    
    install(name, factory) {
        installFactory(this, name, 'instance', factory);
    }
    
    get(name) {
        const entry = this.factoryEntries[name];
        
        if (!entry) {
            throw new NoSuchFactory({ name });
        }
        
        const args = [...arguments].slice(1);
        
        let result;
        switch (entry.type) {
            case 'singleton': {
                const singletonKey = JSON.stringify([name, args]);
                if (!this.cachedSingletons[singletonKey]) {
                    this.cachedSingletons[singletonKey] =
                            evaluate(this, entry.factory, args);
                }
                
                result = this.cachedSingletons[singletonKey];
                
                break;
            }
            case 'instance': {
                result = evaluate(this, entry.factory, args);
                break;
            }
            default: {
                throw new Error('Unknown entry type: ' + entry.type);
            }
        }
        
        return result;
    }
};

function evaluate(sbd, factory, args) {
    return factory(sbd, ...args);
}

function installFactory(sbd, name, type, factory) {
    sbd.factoryEntries[name] = { type, factory };
}
