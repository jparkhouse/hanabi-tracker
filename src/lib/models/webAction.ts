interface WebAction {
    label: string;
    action: () => void | Promise<void>;
}

export type { WebAction };