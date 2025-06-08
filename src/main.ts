import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

import PrimeVue from 'primevue/config';

// Component Imports
import InputNumber from 'primevue/inputnumber';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';         
import Select from 'primevue/select';     
import InputText from 'primevue/inputtext';   
import Message from 'primevue/message';       

// Theme and Icons
import 'primeicons/primeicons.css';
import Aura from '@primeuix/themes/aura'

const app = createApp(App);

app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            darkModeSelector: 'none',
        }
    }
});

app.use(router);

// Global Component Registration
app.component('InputNumber', InputNumber);
app.component('DataTable', DataTable);
app.component('Column', Column);
                  
app.component('Button', Button);              
app.component('Dropdown', Select);          
app.component('InputText', InputText);        
app.component('Message', Message);            

app.mount('#app');