import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createId } from "@/lib/id";

export const useMapStore = create(
  persist(
    (set, get) => ({
      domains: [],
      categories: [],
      systems: [],
      connections: [],
      profiles: [],
      activeProfileId: null,

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

      addCategory: (data) => {
        const category = {
          id: createId(),
          name: data.name,
          color: data.color,
          description: data.description || null,
          position: get().categories.length,
          createdAt: Date.now(),
        };
        set((s) => ({ categories: [...s.categories, category] }));
        return category;
      },

      updateCategory: (id, data) => {
        set((s) => ({
          categories: s.categories.map((c) =>
            c.id === id ? { ...c, ...data } : c
          ),
        }));
      },

      deleteCategory: (id) => {
        set((s) => ({
          categories: s.categories.filter((c) => c.id !== id),
          systems: s.systems.map((sys) => ({
            ...sys,
            categoryIds: (sys.categoryIds || []).filter((cid) => cid !== id),
          })),
        }));
      },

      reorderCategories: (orderedIds) => {
        set((s) => ({
          categories: orderedIds
            .map((id, i) => {
              const c = s.categories.find((cat) => cat.id === id);
              return c ? { ...c, position: i } : null;
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
          categoryIds: data.categoryIds || [],
          createdAt: Date.now(),
        };
        set((s) => ({ systems: [...s.systems, system] }));
        return system;
      },

      updateSystem: (id, data) => {
        const normalizedData = Object.prototype.hasOwnProperty.call(
          data,
          "categoryIds"
        )
          ? { ...data, categoryIds: data.categoryIds || [] }
          : data;
        set((s) => ({
          systems: s.systems.map((sys) =>
            sys.id === id ? { ...sys, ...normalizedData } : sys
          ),
        }));
      },

      deleteSystem: (id) => {
        set((s) => ({
          systems: s.systems.filter((sys) => sys.id !== id),
          connections: s.connections.filter(
            (c) => c.sourceId !== id && c.targetId !== id
          ),
          profiles: s.profiles.map((p) => ({
            ...p,
            systemIds: p.systemIds.filter((sid) => sid !== id),
          })),
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

      toggleSystemCategory: (systemId, categoryId) => {
        set((s) => ({
          systems: s.systems.map((sys) => {
            if (sys.id !== systemId) return sys;
            const categoryIds = sys.categoryIds || [];
            const has = categoryIds.includes(categoryId);
            return {
              ...sys,
              categoryIds: has
                ? categoryIds.filter((id) => id !== categoryId)
                : [...categoryIds, categoryId],
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

      updateConnection: (id, data) => {
        set((s) => ({
          connections: s.connections.map((c) =>
            c.id === id ? { ...c, ...data } : c
          ),
        }));
      },

      deleteConnection: (id) => {
        set((s) => ({
          connections: s.connections.filter((c) => c.id !== id),
        }));
      },

      getSystem: (id) => get().systems.find((s) => s.id === id),
      getDomain: (id) => get().domains.find((d) => d.id === id),
      getCategory: (id) => get().categories.find((c) => c.id === id),

      getSystemsByDomain: (domainId) =>
        get().systems.filter((s) => s.domainIds.includes(domainId)),

      getSystemsByCategory: (categoryId) =>
        get().systems.filter((s) => (s.categoryIds || []).includes(categoryId)),

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

      seedDefaultCategories: (defaults) => {
        const categories = defaults.map((c, i) => ({
          id: createId(),
          name: c.name,
          color: c.color,
          description: c.description || null,
          position: i,
          createdAt: Date.now(),
        }));
        set({ categories });
      },

      clearAll: () => set({ domains: [], categories: [], systems: [], connections: [] }),

      createProfile: (data) => {
        const profile = {
          id: createId(),
          name: data.name,
          description: data.description || null,
          systemIds: data.systemIds || [],
          createdAt: Date.now(),
        };
        set((s) => ({ profiles: [...s.profiles, profile] }));
        return profile;
      },

      updateProfile: (id, data) => {
        set((s) => ({
          profiles: s.profiles.map((p) =>
            p.id === id ? { ...p, ...data } : p
          ),
        }));
      },

      deleteProfile: (id) => {
        set((s) => ({
          profiles: s.profiles.filter((p) => p.id !== id),
          activeProfileId: s.activeProfileId === id ? null : s.activeProfileId,
        }));
      },

      duplicateProfile: (id) => {
        const source = get().profiles.find((p) => p.id === id);
        if (!source) return null;
        const profile = {
          id: createId(),
          name: `${source.name} (Copy)`,
          description: source.description,
          systemIds: [...source.systemIds],
          createdAt: Date.now(),
        };
        set((s) => ({ profiles: [...s.profiles, profile] }));
        return profile;
      },

      setActiveProfile: (id) => {
        set({ activeProfileId: id });
      },

      addSystemToProfile: (profileId, systemId) => {
        set((s) => ({
          profiles: s.profiles.map((p) => {
            if (p.id !== profileId) return p;
            if (p.systemIds.includes(systemId)) return p;
            return { ...p, systemIds: [...p.systemIds, systemId] };
          }),
        }));
      },

      removeSystemFromProfile: (profileId, systemId) => {
        set((s) => ({
          profiles: s.profiles.map((p) => {
            if (p.id !== profileId) return p;
            return { ...p, systemIds: p.systemIds.filter((id) => id !== systemId) };
          }),
        }));
      },

      toggleSystemInProfile: (profileId, systemId) => {
        set((s) => ({
          profiles: s.profiles.map((p) => {
            if (p.id !== profileId) return p;
            const has = p.systemIds.includes(systemId);
            return {
              ...p,
              systemIds: has
                ? p.systemIds.filter((id) => id !== systemId)
                : [...p.systemIds, systemId],
            };
          }),
        }));
      },
    }),
    {
      name: "datapus-map-store",
      version: 2,
      migrate: (persisted, version) => {
        let next = persisted || {};
        if (version === 0) {
          next = {
            ...next,
            profiles: [],
            activeProfileId: null,
          };
        }

        if (version < 2) {
          next = {
            ...next,
            categories: Array.isArray(next.categories) ? next.categories : [],
            systems: Array.isArray(next.systems)
              ? next.systems.map((sys) => ({
                  ...sys,
                  domainIds: Array.isArray(sys.domainIds) ? sys.domainIds : [],
                  categoryIds: Array.isArray(sys.categoryIds) ? sys.categoryIds : [],
                }))
              : [],
          };
        }

        return next;
      },
    }
  )
);

