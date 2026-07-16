export class PageLoadError extends Error {
  constructor(cause: unknown) {
    super('A page module could not be loaded.', { cause });
    this.name = 'PageLoadError';
  }
}

export const loadPageModule = async <Module,>(modulePromise: Promise<Module>): Promise<Module> => {
  try {
    return await modulePromise;
  } catch (error) {
    throw new PageLoadError(error);
  }
};

