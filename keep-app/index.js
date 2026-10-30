import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent chama AppRegistry.registerComponent('main', () => App)
// e garante que o ambiente funcione tanto no Expo Go quanto em build nativa.
registerRootComponent(App);

// O Expo Snack renderiza o arquivo apontado por "main" no package.json e exige
// que ele tenha um export default. Exportar App aqui mantém a compatibilidade
// com o Snack sem afetar a execução local.
export default App;
