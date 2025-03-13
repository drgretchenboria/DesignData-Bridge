import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Project, Wireframe, DataLineage, OpenMetadataConfig, Comment, User } from '../types';

type ActiveView = 'dashboard' | 'wireframes' | 'dataLineage' | 'schema' | 'profile' | 'settings' | 'help';

interface State {
  currentProject: Project | null;
  projects: Project[];
  wireframes: Wireframe[];
  dataLineage: DataLineage[];
  activeSetting: ActiveView;
  figmaToken: string | null;
  openMetadataConfig: OpenMetadataConfig | null;
  comments: Comment[];
  currentUser: User | null;
  setCurrentProject: (project: Project | null) => void;
  addProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  addWireframe: (wireframe: Wireframe) => void;
  deleteWireframe: (id: string) => void;
  addDataLineage: (lineage: DataLineage) => void;
  deleteDataLineage: (id: string) => void;
  updateWireframe: (id: string, wireframe: Partial<Wireframe>) => void;
  updateDataLineage: (id: string, lineage: Partial<DataLineage>) => void;
  setActiveSetting: (setting: ActiveView) => void;
  deleteElement: (wireframeId: string, elementId: string) => void;
  deleteDataLink: (wireframeId: string, elementId: string, linkId: string) => void;
  setFigmaToken: (token: string | null) => void;
  setOpenMetadataConfig: (config: OpenMetadataConfig | null) => void;
  addComment: (comment: Comment) => void;
  deleteComment: (id: string) => void;
  setCurrentUser: (user: User | null) => void;
  resetStore: () => void;
}

const initialState = {
  currentProject: null,
  projects: [],
  wireframes: [],
  dataLineage: [],
  activeSetting: 'dashboard' as ActiveView,
  figmaToken: null,
  openMetadataConfig: null,
  comments: [],
  currentUser: null
};

export const useStore = create<State>()(
  persist(
    (set) => ({
      ...initialState,
      setCurrentProject: (project) => set({ currentProject: project }),
      addProject: (project) =>
        set((state) => ({ projects: [...state.projects, project] })),
      deleteProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          currentProject: state.currentProject?.id === id ? null : state.currentProject
        })),
      addWireframe: (wireframe) =>
        set((state) => ({
          wireframes: [...state.wireframes, wireframe]
        })),
      deleteWireframe: (id) =>
        set((state) => ({
          wireframes: state.wireframes.filter((w) => w.id !== id),
          projects: state.projects.map(p => ({
            ...p,
            wireframeIds: p.wireframeIds?.filter(wId => wId !== id) || []
          }))
        })),
      addDataLineage: (lineage) =>
        set((state) => ({ dataLineage: [...state.dataLineage, lineage] })),
      deleteDataLineage: (id) =>
        set((state) => ({
          dataLineage: state.dataLineage.filter((l) => l.id !== id)
        })),
      updateWireframe: (id, wireframe) =>
        set((state) => ({
          wireframes: state.wireframes.map((w) =>
            w?.id === id ? { ...w, ...wireframe } : w
          ).filter(Boolean) as Wireframe[],
        })),
      updateDataLineage: (id, lineage) =>
        set((state) => ({
          dataLineage: state.dataLineage.map((l) =>
            l.id === id ? { ...l, ...lineage } : l
          ),
        })),
      setActiveSetting: (setting) => set({ activeSetting: setting }),
      deleteElement: (wireframeId, elementId) =>
        set((state) => ({
          wireframes: state.wireframes.map((w) =>
            w?.id === wireframeId
              ? {
                  ...w,
                  elements: (w.elements || []).filter((e) => e?.id !== elementId)
                }
              : w
          ).filter(Boolean) as Wireframe[],
          comments: state.comments.filter(c => c.elementId !== elementId)
        })),
      deleteDataLink: (wireframeId, elementId, linkId) =>
        set((state) => ({
          wireframes: state.wireframes.map((w) =>
            w?.id === wireframeId
              ? {
                  ...w,
                  elements: (w.elements || []).map((e) =>
                    e?.id === elementId
                      ? {
                          ...e,
                          data: {
                            ...e.data,
                            dataLinks: (e.data.dataLinks || []).filter((l) => l?.id !== linkId),
                          },
                        }
                      : e
                  ).filter(Boolean)
                }
              : w
          ).filter(Boolean) as Wireframe[],
        })),
      setFigmaToken: (token) => set({ figmaToken: token }),
      setOpenMetadataConfig: (config) => set({ openMetadataConfig: config }),
      addComment: (comment) =>
        set((state) => ({
          comments: [...state.comments, comment]
        })),
      deleteComment: (id) =>
        set((state) => ({
          comments: state.comments.filter(c => c.id !== id)
        })),
      setCurrentUser: (user) => set({ currentUser: user }),
      resetStore: () => set(initialState)
    }),
    {
      name: 'design-data-storage',
      partialize: (state) => ({
        figmaToken: state.figmaToken,
        wireframes: state.wireframes,
        dataLineage: state.dataLineage,
        openMetadataConfig: state.openMetadataConfig,
        comments: state.comments,
        currentUser: state.currentUser
      }),
    }
  )
);