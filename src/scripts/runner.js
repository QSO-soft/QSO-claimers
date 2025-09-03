/* eslint-disable no-console */
import { spawn } from 'child_process';
import fs from 'fs';

import inquirer from 'inquirer';

import { SECRET_PHRASE } from '../_inputs/settings/global.js';
const savedDelegateModules = JSON.parse(
  fs.readFileSync(new URL('../_outputs/json/delegate-saved-modules.json', import.meta.url))
);
const savedElixirModules = JSON.parse(
  fs.readFileSync(new URL('../_outputs/json/elixir-saved-modules.json', import.meta.url))
);
const savedHyperlaneModules = JSON.parse(
  fs.readFileSync(new URL('../_outputs/json/hyperlane-saved-modules.json', import.meta.url))
);
const savedSymbioticModules = JSON.parse(
  fs.readFileSync(new URL('../_outputs/json/symbiotic-saved-modules.json', import.meta.url))
);
// const savedZoraModules = JSON.parse(
//   fs.readFileSync(new URL('../_outputs/json/zora-saved-modules.json', import.meta.url))
// );
// const savedPrivaseaModules = JSON.parse(
//   fs.readFileSync(new URL('../_outputs/json/privasea-saved-modules.json', import.meta.url))
// );
// const savedMovementModules = JSON.parse(
//   fs.readFileSync(new URL('../_outputs/json/movement-saved-modules.json', import.meta.url))
// );
// const savedCalderaModules = JSON.parse(
//   fs.readFileSync(new URL('../_outputs/json/caldera-saved-modules.json', import.meta.url))
// );
const savedGaiaModules = JSON.parse(
  fs.readFileSync(new URL('../_outputs/json/gaia-saved-modules.json', import.meta.url))
);
const savedSomniaModules = JSON.parse(
  fs.readFileSync(new URL('../_outputs/json/somnia-saved-modules.json', import.meta.url))
);
const savedMitosisModules = JSON.parse(
  fs.readFileSync(new URL('../_outputs/json/mitosis-saved-modules.json', import.meta.url))
);
const savedDebankModules = JSON.parse(
  fs.readFileSync(new URL('../_outputs/json/debank-saved-modules.json', import.meta.url))
);
const savedLineaModules = JSON.parse(
  fs.readFileSync(new URL('../_outputs/json/linea-saved-modules.json', import.meta.url))
);

const scripts = {
  // movement: 'movement',
  // privasea: 'privasea',
  // caldera: 'caldera',
  mitosis: 'mitosis',
  somnia: 'somnia',
  linea: 'linea',
  gaia: 'gaia',
  hyperlane: 'hyperlane',
  // story: 'story',
  delegate: 'delegate',
  // odos: 'odos',
  // scroll: 'scroll',
  // taiko: 'taiko',
  // polyhedra: 'polyhedra',
  // layerZero: 'layer-zero',
  // superform: 'superform',
  elixir: 'elixir',
  symbiotic: 'symbiotic',
  // swell: 'swell',
  // zora: 'zora',
  debank: 'debank',
};
const aliases = {
  // runCaldera: '1. Caldera',
  // runMovement: '1. Movement',
  // runPrivasea: '2. PrivaSea',
  // runZora: '2. Zora',
  runDebank: '1. Debank',
  runMitosis: '2. Mitosis',
  runSomnia: '3. Somnia',
  runLinea: '4. Linea',
  runGaia: '5. Gaia',
  runHyperlane: '6. Hyperlane',
  // runStory: '1. Story',
  runDelegate: '7. Delegate',
  // runOdos: '3. Odos',
  // runScroll: '4. Scroll',
  // runTaiko: '5. Taiko',
  // runPolyhedra: '6. Polyhedra',
  // runLayerZero: '7. LayerZero',
  // runSuperform: '8. Superfrom',
  runElixir: '8. Elixir',
  runSymbiotic: '9. Symbiotic',
  // runSwell: '11. Swell',

  exit: '0. Выйти',
};

const commandAliases = {
  [aliases.runDebank]: scripts.debank,
  [aliases.runMitosis]: scripts.mitosis,
  [aliases.runSomnia]: scripts.somnia,
  [aliases.runLinea]: scripts.linea,
  [aliases.runGaia]: scripts.gaia,
  // [aliases.runCaldera]: scripts.caldera,
  // [aliases.runMovement]: scripts.movement,
  // [aliases.runPrivasea]: scripts.privasea,
  // [aliases.runZora]: scripts.zora,
  [aliases.runHyperlane]: scripts.hyperlane,
  // [aliases.runStory]: scripts.story,
  [aliases.runDelegate]: scripts.delegate,
  // [aliases.runOdos]: scripts.odos,
  // [aliases.runScroll]: scripts.scroll,
  // [aliases.runTaiko]: scripts.taiko,
  // [aliases.runPolyhedra]: scripts.polyhedra,
  // [aliases.runLayerZero]: scripts.layerZero,
  // [aliases.runSuperform]: scripts.superform,
  [aliases.runElixir]: scripts.elixir,
  [aliases.runSymbiotic]: scripts.symbiotic,
  // [aliases.runSwell]: scripts.swell,

  [aliases.exit]: 'exit',
};

const getStartMainCommand = async (projectName) => {
  const runMainCommand = 'npm run claimer:main';
  const restartLastMainCommand = 'npm run claimer:restart-last';

  let currentSavedModulesToUse;
  switch (projectName) {
    case scripts.debank:
      currentSavedModulesToUse = savedDebankModules;
      break;
    case scripts.mitosis:
      currentSavedModulesToUse = savedMitosisModules;
      break;
    case scripts.somnia:
      currentSavedModulesToUse = savedSomniaModules;
      break;
    case scripts.linea:
      currentSavedModulesToUse = savedLineaModules;
      break;
    case scripts.gaia:
      currentSavedModulesToUse = savedGaiaModules;
      break;
    // case scripts.caldera:
    //   currentSavedModulesToUse = savedCalderaModules;
    //   break;
    // case scripts.movement:
    //   currentSavedModulesToUse = savedMovementModules;
    //   break;
    // case scripts.privasea:
    //   currentSavedModulesToUse = savedPrivaseaModules;
    //   break;
    // case scripts.zora:
    //   currentSavedModulesToUse = savedZoraModules;
    //   break;
    case scripts.hyperlane:
      currentSavedModulesToUse = savedHyperlaneModules;
      break;
    // case scripts.story:
    //   currentSavedModulesToUse = savedStoryModules;
    //   break;
    case scripts.delegate:
      currentSavedModulesToUse = savedDelegateModules;
      break;
    // case scripts.odos:
    //   currentSavedModulesToUse = savedOdosModules;
    //   break;
    // case scripts.scroll:
    //   currentSavedModulesToUse = savedScrollModules;
    //   break;
    // case scripts.taiko:
    //   currentSavedModulesToUse = savedTaikoModules;
    //   break;
    // case scripts.polyhedra:
    //   currentSavedModulesToUse = savedPolyhedraModules;
    //   break;
    // case scripts.layerZero:
    //   currentSavedModulesToUse = savedLayerZeroModules;
    //   break;
    // case scripts.superform:
    //   currentSavedModulesToUse = savedSuperformModules;
    //   break;
    case scripts.elixir:
      currentSavedModulesToUse = savedElixirModules;
      break;
    case scripts.symbiotic:
      currentSavedModulesToUse = savedSymbioticModules;
      break;
    // case scripts.swell:
    //   currentSavedModulesToUse = savedSwellModules;
    //   break;

    default:
      break;
  }

  let command;
  const isFinished = currentSavedModulesToUse.isFinished;
  if (typeof isFinished === 'boolean' && !isFinished) {
    const startLastScriptMessage = 'Да (восстановить выполнение прошлого скрипта)';
    const choicesQuestion = [
      {
        type: 'list',
        name: 'runMainOrRestartQuestions',
        message: `Предыдущий скрипт не закончил свое выполнение для ${currentSavedModulesToUse.route} роута, продолжить его?`,
        choices: [startLastScriptMessage, 'Нет (выполнить новый скрипт, но база будет очищена)'],
      },
    ];

    const { runMainOrRestartQuestions } = await inquirer.prompt(choicesQuestion);
    const isStartLastScript = runMainOrRestartQuestions === startLastScriptMessage;

    command = isStartLastScript ? restartLastMainCommand : runMainCommand;
  } else {
    command = runMainCommand;
  }

  const secret = await getSecretPhrase();
  return {
    command,
    secret,
    projectName,
  };
};

const getSecretPhrase = async () => {
  const input = {
    type: 'input',
    name: 'secret',
    message: 'Введите секретную фразу для кодирования приватных ключей:',
    validate: (input) => {
      if (input.trim() === '') {
        return 'Secret cannot be empty';
      }
      return true;
    },
  };

  if (SECRET_PHRASE) {
    return SECRET_PHRASE;
  }

  const { secret } = await inquirer.prompt(input);

  return secret;
};

(async () => {
  const aliasChoices = Object.keys(commandAliases);

  const questions = [
    {
      type: 'list',
      name: 'alias',
      message: 'Выберите скрипт для выполнения:',
      choices: aliasChoices,
    },
  ];

  const { alias } = await inquirer.prompt(questions);
  const selectedAlias = alias;
  let selectedCommand = commandAliases[selectedAlias];
  let args = [];

  switch (selectedAlias) {
    case aliases.runDebank: {
      const { command, secret, projectName } = await getStartMainCommand(scripts.debank);
      selectedCommand = command;
      args = [secret, projectName, projectName];
      break;
    }
    case aliases.runMitosis: {
      const { command, secret, projectName } = await getStartMainCommand(scripts.mitosis);
      selectedCommand = command;
      args = [secret, projectName, projectName];
      break;
    }
    case aliases.runSomnia: {
      const { command, secret, projectName } = await getStartMainCommand(scripts.somnia);
      selectedCommand = command;
      args = [secret, projectName, projectName];
      break;
    }
    case aliases.runLinea: {
      const { command, secret, projectName } = await getStartMainCommand(scripts.linea);
      selectedCommand = command;
      args = [secret, projectName, projectName];
      break;
    }
    case aliases.runGaia: {
      const { command, secret, projectName } = await getStartMainCommand(scripts.gaia);
      selectedCommand = command;
      args = [secret, projectName, projectName];
      break;
    }
    // case aliases.runCaldera: {
    //   const { command, secret, projectName } = await getStartMainCommand(scripts.caldera);
    //   selectedCommand = command;
    //   args = [secret, projectName, projectName];
    //   break;
    // }
    // case aliases.runMovement: {
    //   const { command, secret, projectName } = await getStartMainCommand(scripts.movement);
    //   selectedCommand = command;
    //   args = [secret, projectName, projectName];
    //   break;
    // }
    // case aliases.runPrivasea: {
    //   const { command, secret, projectName } = await getStartMainCommand(scripts.privasea);
    //   selectedCommand = command;
    //   args = [secret, projectName, projectName];
    //   break;
    // }
    // case aliases.runZora: {
    //   const { command, secret, projectName } = await getStartMainCommand(scripts.zora);
    //   selectedCommand = command;
    //   args = [secret, projectName, projectName];
    //   break;
    // }
    case aliases.runHyperlane: {
      const { command, secret, projectName } = await getStartMainCommand(scripts.hyperlane);
      selectedCommand = command;
      args = [secret, projectName, projectName];
      break;
    }
    // case aliases.runStory: {
    //   const { command, secret, projectName } = await getStartMainCommand(scripts.story);
    //   selectedCommand = command;
    //   args = [secret, projectName, projectName];
    //   break;
    // }
    case aliases.runDelegate: {
      const { command, secret, projectName } = await getStartMainCommand(scripts.delegate);
      selectedCommand = command;
      args = [secret, projectName, projectName];
      break;
    }
    // case aliases.runOdos: {
    //   const { command, secret, projectName } = await getStartMainCommand(scripts.odos);
    //   selectedCommand = command;
    //   args = [secret, projectName, projectName];
    //   break;
    // }
    // case aliases.runScroll: {
    //   const { command, secret, projectName } = await getStartMainCommand(scripts.scroll);
    //   selectedCommand = command;
    //   args = [secret, projectName, projectName];
    //   break;
    // }
    // case aliases.runTaiko: {
    //   const { command, secret, projectName } = await getStartMainCommand(scripts.taiko);
    //   selectedCommand = command;
    //   args = [secret, projectName, projectName];
    //   break;
    // }
    // case aliases.runPolyhedra: {
    //   const { command, secret, projectName } = await getStartMainCommand(scripts.polyhedra);
    //   selectedCommand = command;
    //   args = [secret, projectName, projectName];
    //   break;
    // }
    // case aliases.runLayerZero: {
    //   const { command, secret, projectName } = await getStartMainCommand(scripts.layerZero);
    //   selectedCommand = command;
    //   args = [secret, projectName, projectName];
    //   break;
    // }
    // case aliases.runSuperform: {
    //   const { command, secret, projectName } = await getStartMainCommand(scripts.superform);
    //   selectedCommand = command;
    //   args = [secret, projectName, projectName];
    //   break;
    // }
    case aliases.runElixir: {
      const { command, secret, projectName } = await getStartMainCommand(scripts.elixir);
      selectedCommand = command;
      args = [secret, projectName, projectName];
      break;
    }
    case aliases.runSymbiotic: {
      const { command, secret, projectName } = await getStartMainCommand(scripts.symbiotic);
      selectedCommand = command;
      args = [secret, projectName, projectName];
      break;
    }
    // case aliases.runSwell: {
    //   const { command, secret, projectName } = await getStartMainCommand(scripts.swell);
    //   selectedCommand = command;
    //   args = [secret, projectName, projectName];
    //   break;
    // }

    default:
      break;
  }

  const commandProcess = spawn(selectedCommand, args, {
    shell: true,
  });

  // Отображаем вывод команды
  commandProcess.stdout.on('data', (data) => {
    process.stdout.write(data.toString());
  });

  let errorCalled = false;
  // Отображаем ошибки (если есть)
  commandProcess.stderr.on('data', (data) => {
    if (!errorCalled) {
      let errMessage = data.toString();

      if (errMessage.includes('triggerUncaughtException')) {
        errMessage =
          'Произошла неизвестная ошибка: пожалуйста, установите зависимости выполнив "npm i", сравните global.js с global.example.js или вызовите "npm run build", что-бы увидеть ошибку';
      }
      // else {
      //   errMessage = errMessage
      //     .split('\n')
      //     .filter((string) => !!string)
      //     .at(-1);
      // }

      process.stderr.write(
        `\x1b[31m${errMessage}\x1b[0m
`
      );
      errorCalled = true;
    }
  });

  // Завершаем выполнение команды и выводим код завершения
  commandProcess.on('close', (code) => {
    if (code === 0) {
      console.log(`Скрипт успешно выполнен: ${selectedCommand}`);
    } else {
      console.error(`Ошибка выполнения скрипта: ${selectedCommand}`);
    }
  });
})();
