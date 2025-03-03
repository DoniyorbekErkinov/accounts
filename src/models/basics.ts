export interface ISelectList {
  orderCode?: string;
  text: string;
  value: number | string;
}

export interface IAccounts {
  account: string | string[];
  accountType: 1 | 2;
  password: string | null;
  login: string | null;
}
