import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

import PrimeVue from 'primevue/config';

import InputNumber from 'primevue/inputnumber';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Card from 'primevue/card';


import 'primeicons/primeicons.css';
import Aura from '@primeuix/themes/aura'

const app = createApp(App);

app.use(PrimeVue, {
    // Default theme configuration
    theme: {
        preset: Aura,
        options: {
          darkModeSelector: false || 'none',
        }
    }
 });

app.use(router);
app.component('InputNumber', InputNumber);
app.component('DataTable', DataTable);
app.component('Column', Column);

app.mount('#app');