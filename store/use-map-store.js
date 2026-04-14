import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createId } from "@/lib/id";

export const useMapStore = create(
  persist(
    (set, get) => ({
      domains: [],
      systems: [],
      connections: [],

      addDomain: (data) => {
        const domain = {
          id: createId(),
          name: data.name,
          color: data.color,
          description: data.description || null,
          position: get().domains.length,
          createdAt: Date.now(),
        };
        set((s) => ({ domains: [...s.domains, domain] }));
        return domain;
      },

      updateDomain: (id, data) => {
        set((s) => ({
          domains: s.domains.map((d) =>
            d.id === id ? { ...d, ...data } : d
          ),
        }));
      },

      deleteDomain: (id) => {
        set((s) => ({
          domains: s.domains.filter((d) => d.id !== id),
          systems: s.systems.map((sys) => ({
            ...sys,
            domainIds: sys.domainIds.filter((did) => did !== id),
          })),
        }));
      },

      reorderDomains: (orderedIds) => {
        set((s) => ({
          domains: orderedIds
            .map((id, i) => {
              const d = s.domains.find((dom) => dom.id === id);
              return d ? { ...d, position: i } : null;
            })
            .filter(Boolean),
        }));
      },

      addSystem: (data) => {
        const system = {
          id: createId(),
          name: data.name,
          description: data.description || null,
          vendor: data.vendor || null,
          url: data.url || null,
          domainIds: data.domainIds || [],
          createdAt: Date.now(),
        };
        set((s) => ({ systems: [...s.systems, system] }));
        return system;
      },

      updateSystem: (id, data) => {
        set((s) => ({
          systems: s.systems.map((sys) =>
            sys.id === id ? { ...sys, ...data } : sys
          ),
        }));
      },

      deleteSystem: (id) => {
        set((s) => ({
          systems: s.systems.filter((sys) => sys.id !== id),
          connections: s.connections.filter(
            (c) => c.sourceId !== id && c.targetId !== id
          ),
        }));
      },

      toggleSystemDomain: (systemId, domainId) => {
        set((s) => ({
          systems: s.systems.map((sys) => {
            if (sys.id !== systemId) return sys;
            const has = sys.domainIds.includes(domainId);
            return {
              ...sys,
              domainIds: has
                ? sys.domainIds.filter((d) => d !== domainId)
                : [...sys.domainIds, domainId],
            };
          }),
        }));
      },

      addConnection: (data) => {
        const connection = {
          id: createId(),
          sourceId: data.sourceId,
          targetId: data.targetId,
          type: data.type,
          note: data.note || null,
          createdAt: Date.now(),
        };
        set((s) => ({ connections: [...s.connections, connection] }));
        return connection;
      },

      deleteConnection: (id) => {
        set((s) => ({
          connections: s.connections.filter((c) => c.id !== id),
        }));
      },

      getSystem: (id) => get().systems.find((s) => s.id === id),
      getDomain: (id) => get().domains.find((d) => d.id === id),

      getSystemsByDomain: (domainId) =>
        get().systems.filter((s) => s.domainIds.includes(domainId)),

      getConnectionsForSystem: (systemId) =>
        get().connections.filter(
          (c) => c.sourceId === systemId || c.targetId === systemId
        ),

      getConnectionCount: (systemId) =>
        get().connections.filter(
          (c) => c.sourceId === systemId || c.targetId === systemId
        ).length,

      connectionExists: (sourceId, targetId, type) =>
        get().connections.some(
          (c) =>
            c.type === type &&
            ((c.sourceId === sourceId && c.targetId === targetId) ||
              (c.sourceId === targetId && c.targetId === sourceId))
        ),

      seedDefaultDomains: (defaults) => {
        const domains = defaults.map((d, i) => ({
          id: createId(),
          name: d.name,
          color: d.color,
          description: null,
          position: i,
          createdAt: Date.now(),
        }));
        set({ domains });
      },

      clearAll: () => set({ domains: [], systems: [], connections: [] }),
    }),
    {
      name: "datapus-map-store",
    }
  )
);
