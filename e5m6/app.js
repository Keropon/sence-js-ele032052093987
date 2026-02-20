const { Command } = require('commander');
const pc = require('picocolors');

const program = new Command();

program
  .name('app')
  .description('Gestor de Tareas por Consola')
  .version('1.0.0');

program
  .command('crear')
  .alias('c')
  .description('Crea una nueva tarea')
  .requiredOption('-t, --titulo <titulo>', 'El título de la tarea')
  .action((options) => {
    try {
      console.log(pc.green(`Tarea "${options.titulo}" creada exitosamente.`));
    } catch (error) {
      console.log(pc.red('Ha ocurrido un error inesperado.'));
    }
  });

program.parse();
