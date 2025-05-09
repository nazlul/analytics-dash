export {};

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (params: {
            client_id: string;
            callback: (response: any) => void;
          }) => void;
          renderButton: (element: HTMLElement | null, options: any) => void;
        };
      };
    };
  }
}
