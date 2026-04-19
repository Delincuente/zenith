/**
 * Activity Service
 *
 * Provides a shared utility for logging user activity events.
 * This is intentionally a lightweight, fire-and-forget logger —
 * failures are swallowed so they never block the main request flow.
 */

/**
 * Log a user activity event to the console (and optionally a DB table later).
 *
 * @param {string} userId   - The ID of the user performing the action
 * @param {string} action   - Description of the action (e.g. 'Created Project')
 * @param {string} entity   - Entity type affected (e.g. 'Project', 'Task')
 * @param {string} entityId - ID of the affected entity
 */
const logActivity = async (userId, action, entity, entityId) => {
  try {
    // TODO: Persist activity to an ActivityLog model when the table is added.
    // e.g. await db.ActivityLog.create({ user_id: userId, action, entity, entity_id: entityId });
    console.log(`[Activity] user=${userId} | ${action} | ${entity}#${entityId}`);
  } catch (err) {
    // Never let logging failures bubble up and break the request
    console.error('[Activity] Failed to log activity:', err.message);
  }
};

module.exports = { logActivity };
