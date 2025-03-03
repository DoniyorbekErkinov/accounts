import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { IAccounts, ISelectList } from '@/models/basics';

export const useAccountStore = defineStore('account', () => {
  // Default data
  const defaultAccount: IAccounts = {
    accountType: 1,
    password: null,
    login: null,
    account: [], // Array of { text: string }
  };

  // Types for accounts
  const accountTypes = ref<ISelectList[]>([
    { text: 'LDAP', value: 1 },
    { text: 'Локальная', value: 2 },
  ]);

  // Data for local state and localstorage
  const accounts = ref<IAccounts[]>([]);
  const storedAccounts = localStorage.getItem('accounts');

  if (storedAccounts) {
    try {
      accounts.value = JSON.parse(storedAccounts);
    } catch (error) {
      console.error(
        'Ошибка при парсинге сохранённых учетных записей, сброс к значению по умолчанию:',
        error
      );
      accounts.value = [defaultAccount];
      localStorage.setItem('accounts', JSON.stringify(accounts.value));
    }
  } else {
    accounts.value = [defaultAccount];
    localStorage.setItem('accounts', JSON.stringify(accounts.value));
  }

  // Updates localStorage
  function updateAccounts(newAccounts: IAccounts[]) {
    accounts.value = newAccounts;
    localStorage.setItem('accounts', JSON.stringify(newAccounts));
  }

  return { accountTypes, accounts, updateAccounts };
});
