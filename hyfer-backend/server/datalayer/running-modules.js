/* eslint-disable camelcase */
const _ = require('lodash');
const {
  execQuery,
  beginTransaction,
  commit,
  rollback,
} = require('./database');
const modules = require('./modules');

const GET_TIME_LINE_QUERY = `
  SELECT \`groups\`.id,
    \`groups\`.group_name,
    \`groups\`.starting_date,
    running_modules.duration,
    running_modules.id AS running_module_id,
    running_modules.position,
    modules.module_name,
    modules.color,
    modules.git_repo,
    modules.optional
    FROM \`groups\`
    INNER JOIN running_modules ON running_modules.group_id = \`groups\`.id
    INNER JOIN modules ON running_modules.module_id = modules.id
    WHERE \`groups\`.archived=0
    ORDER BY \`groups\`.starting_date, running_modules.position`;
const GET_RUNNING_MODULES_QUERY =
  'SELECT * FROM running_modules';
const GET_RUNNING_MODULE_BY_ID =
  'SELECT * FROM running_modules WHERE id=?';
const UPDATE_RUNNING_MODULE =
  'UPDATE running_modules SET duration=?, position=?, notes=? WHERE id=?';
const DELETE_RUNNING_MODULE =
  'DELETE FROM running_modules WHERE id=?';
const INSERT_RUNNING_MODULE =
  'INSERT INTO running_modules (module_id, group_id, duration, position, notes) VALUES(?,?,?,?,?)';

const resequenceModules = mods => mods.map((mod, index) => ({ ...mod, position: index }));

async function getTimeline(con) {
  const rows = await execQuery(con, GET_TIME_LINE_QUERY);
  const grouped = _.groupBy(rows, row => row.group_name);
  return Object.keys(grouped)
    .reduce((acc, groupName) => {
      let mods = grouped[groupName];
      const { id: group_id, starting_date } = mods[0];
      mods = mods.map(m => ({
        duration: m.duration,
        git_repo: m.git_repo,
        module_name: m.module_name,
        position: m.position,
        running_module_id: m.running_module_id,
        color: m.color,
      }));
      acc[groupName] = {
        group_id,
        starting_date,
        modules: mods,
      };
      return acc;
    }, {});
}

function getRunningModuleById(con, runningId) {
  const sql = GET_RUNNING_MODULE_BY_ID;
  return execQuery(con, sql, [runningId]);
}

function getRunningModules(con, groupId) {
  const sql = `${GET_RUNNING_MODULES_QUERY} WHERE group_id=? ORDER BY position`;
  return execQuery(con, sql, [groupId]);
}

async function bulkUpdateRunningsModules(con, existingMods, updatedMods, groupId) {
  const inserts = updatedMods.filter(mod => mod.id === undefined);
  const deletes = existingMods.filter(mod1 => !updatedMods.find(mod2 => mod1.id === mod2.id));
  const updates = updatedMods.filter((mod) => {
    const existingMod = existingMods.find(mod2 => mod.id === mod2.id);
    if (existingMod == null) {
      return false;
    }
    return existingMod.duration !== mod.duration
      || existingMod.position !== mod.position
      || existingMod.notes !== mod.notes;
  });

  const insertPromises = inserts.map((mod) => {
    const {
      module_id,
      group_id,
      duration,
      position,
      notes,
    } = mod;
    return execQuery(con, INSERT_RUNNING_MODULE, [
      module_id,
      group_id,
      duration,
      position,
      notes || '',
    ]);
  });

  const deletePromises = deletes.map(mod => execQuery(con, DELETE_RUNNING_MODULE, [mod.id]));

  const updatePromises = updates.map((mod) => {
    const {
      duration,
      position,
      notes,
      id,
    } = mod;
    return execQuery(con, UPDATE_RUNNING_MODULE, [
      duration,
      position,
      notes || '',
      id,
    ]);
  });

  const allPromises = [...insertPromises, ...deletePromises, ...updatePromises];
  if (allPromises.length > 0) {
    try {
      await beginTransaction(con);
      await Promise.all(updatePromises);
      await commit(con);
    } catch (err) {
      await rollback(con);
      throw err;
    }
  }

  return getRunningModules(con, groupId);
}

async function updateRunningModule(con, updates, groupId, position) {
  const existingMods = await getRunningModules(con, groupId);
  const targetMod = { ...existingMods[position], ...updates };

  let updatedMods = [...existingMods];
  updatedMods.splice(position, 1);
  updatedMods.splice(updates.position || position, 0, targetMod);
  updatedMods = resequenceModules(updatedMods);

  return bulkUpdateRunningsModules(con, existingMods, updatedMods, groupId);
}

async function deleteRunningModule(con, groupId, position) {
  const existingMods = await getRunningModules(con, groupId);
  let updatedMods = existingMods.filter(mod => mod.position !== position);
  updatedMods = resequenceModules(updatedMods);
  return bulkUpdateRunningsModules(con, existingMods, updatedMods, groupId);
}

async function addRunningModule(con, moduleId, groupId, position) {
  const [module] = await modules.getModule(con, moduleId);
  const { id: module_id, default_duration: duration } = module;

  const newMod = {
    module_id,
    group_id: groupId,
    duration,
    position,
    notes: '',
  };

  const existingMods = await getRunningModules(con, groupId);
  let updatedMods = [...existingMods];
  updatedMods.splice(position, 0, newMod);
  updatedMods = resequenceModules(updatedMods);

  await bulkUpdateRunningsModules(con, existingMods, updatedMods);
  return getRunningModules(con, groupId);
}

async function splitRunningModule(con, groupId, position) {
  const existingMods = await getRunningModules(con, groupId);

  const {
    module_id,
    group_id,
    notes,
    duration,
  } = existingMods[position];

  // Can't split a one week module
  if (duration <= 1) {
    return Promise.resolve();
  }

  const newMod = {
    module_id,
    group_id,
    duration: Math.floor(duration / 2),
    notes,
  };

  let updatedMods = [...existingMods];
  updatedMods[position] = { ...updatedMods[position] };
  updatedMods[position].duration -= newMod.duration;
  updatedMods.splice(position + 1, 0, newMod);
  updatedMods = resequenceModules(updatedMods);

  return bulkUpdateRunningsModules(con, existingMods, updatedMods, groupId);
}

async function updateNotes(con, runningId, notes) {
  const sql = 'UPDATE running_modules SET notes=? WHERE id=?';
  return execQuery(con, sql, [notes, runningId]);
}

async function addTeacher(con, currentModule, userId) {
  const query = `INSERT INTO running_module_teachers SET running_module_id=${currentModule} ,
        user_id = (SELECT id FROM users WHERE users.id=${userId})`;
  const { insertId } = await execQuery(con, query);
  return insertId;
}

function deleteTeacher(con, moduleId, userId) {
  return execQuery(con, `DELETE FROM running_module_teachers WHERE running_module_id=${moduleId} AND user_id=${userId};`);
}

module.exports = {
  getTimeline,
  getRunningModuleById,
  getRunningModules,
  addRunningModule,
  updateRunningModule,
  deleteRunningModule,
  splitRunningModule,
  updateNotes,
  addTeacher,
  deleteTeacher,
};
