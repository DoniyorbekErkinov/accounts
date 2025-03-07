<script setup lang="ts">
import { ref } from 'vue';
import Select from '../components/Select.vue';
import { Plus, BadgeAlert, Trash, Eye, EyeOff } from 'lucide-vue-next';
import { useAccountStore } from '../store/accounts';
import type { IAccounts } from '../models/basics';

const accountStore = useAccountStore();

function addAccount() {
  const newAccount: IAccounts = {
    accountType: 1,
    password: null,
    login: null,
    account: [],
  };
  accountStore.accounts.push(newAccount);
  accountStore.updateAccounts(accountStore.accounts);
}

function removeAccount(index: number) {
  accountStore.accounts.splice(index, 1);
  accountStore.updateAccounts(accountStore.accounts);
}

function getAccountLabels(account: any): string {
  if (!account.account || account.account.length === 0) return '';
  return account.account.map((item: { text: string }) => item.text).join('; ');
}

function updateAccountLabels(value: string, account: any) {
  const labels = value
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s !== '')
    .map((s) => ({ text: s }));
  account.account = labels;
  accountStore.updateAccounts(accountStore.accounts);
}

function isAccountValid(account: any): boolean {
  if (
    !account.login ||
    account.login.trim() === '' ||
    account.login.length > 100
  )
    return false;
  if (account.accountType === 2) {
    if (
      !account.password ||
      account.password.trim() === '' ||
      account.password.length > 100
    )
      return false;
  }
  const labelsStr = getAccountLabels(account);
  if (labelsStr && labelsStr.length > 50) return false;
  return true;
}

const showPasswordMap = ref<Record<number, boolean>>({});
</script>

<template>
  <div class="h-screen w-full bg-yellow-50">
    <div class="container mx-auto flex flex-col gap-4 pt-20">
      <!-- Title and button for adding account -->
      <div class="flex items-center gap-4">
        <span class="text-2xl font-medium text-blue-950">Учетные записи</span>
        <button
          @click="addAccount"
          class="text-2xl font-medium text-blue-950 border border-blue-950 opacity-75 cursor-pointer shadow p-2 flex items-center justify-center rounded-md"
        >
          <Plus />
        </button>
      </div>
      <!-- Alert for Title -->
      <div
        class="w-full rounded-md bg-slate-200 flex gap-4 p-4 text-slate-800 font-base"
      >
        <BadgeAlert class="text-slate-700" />
        <span>
          Для указания нескольких меток для одной пары логин/пароль используйте
          разделитель ;
        </span>
      </div>
      <!-- Header for Account -->
      <div
        class="grid grid-cols-4 gap-6 font-semibold text-blue-950 border-b pb-2"
      >
        <div>Метки</div>
        <div>Тип записи</div>
        <div>Логин</div>
        <div>Пароль</div>
      </div>
      <!-- Accounts List -->
      <div class="flex flex-col gap-2">
        <div
          v-for="(account, index) in accountStore.accounts"
          :key="`account-${index}`"
          class="grid grid-cols-4 gap-6 items-center border-b py-2"
        >
          <!-- Title -->
          <div>
            <input
              :value="getAccountLabels(account)"
              @blur="
                (event) =>
                  updateAccountLabels(
                    (event.target as HTMLInputElement)?.value,
                    account
                  )
              "
              maxlength="50"
              class="rounded-md border py-2 px-4 focus:outline-blue-900 w-full bg-white"
              placeholder="Метки (через ;)"
            />
          </div>
          <!-- Tip Account -->
          <div>
            <Select
              :data="accountStore.accountTypes"
              v-model:model-value="account.accountType"
              id="account_types"
            />
          </div>
          <!-- Login and delete button for type LDAP -->
          <div
            class="flex gap-4"
            :class="{ 'col-span-2': account.accountType == 1 }"
          >
            <input
              v-model="account.login"
              maxlength="100"
              @blur="accountStore.updateAccounts(accountStore.accounts)"
              placeholder="Логин"
              class="rounded-md border py-2 px-4 focus:outline-blue-900 w-full bg-white"
              :class="{ 'border-red-500': !isAccountValid(account) }"
            />
            <button
              v-if="account.accountType == 1"
              @click="removeAccount(index)"
              class="text-2xl font-medium text-white bg-red-700 opacity-75 cursor-pointer shadow p-2 flex items-center justify-center rounded-md"
            >
              <Trash :size="20" />
            </button>
          </div>
          <!-- Login, Password and delete button for type "Локальная" -->
          <div v-if="account.accountType == 2" class="flex gap-4 items-center">
            <div class="relative w-full">
              <input
                v-model="account.password"
                :type="showPasswordMap[index] ? 'text' : 'password'"
                maxlength="100"
                @blur="accountStore.updateAccounts(accountStore.accounts)"
                placeholder="Пароль"
                class="rounded-md border py-2 px-4 focus:outline-blue-900 w-full bg-white"
                :class="{ 'border-red-500': !isAccountValid(account) }"
              />
              <button
                type="button"
                @click="showPasswordMap[index] = !showPasswordMap[index]"
                class="absolute inset-y-0 right-0 flex items-center pr-3"
              >
                <Eye v-if="!showPasswordMap[index]" :size="20" />
                <EyeOff v-else :size="20" />
              </button>
            </div>
            <button
              @click="removeAccount(index)"
              class="text-2xl font-medium text-white bg-red-700 opacity-75 cursor-pointer shadow p-2 flex items-center justify-center rounded-md"
            >
              <Trash :size="20" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
