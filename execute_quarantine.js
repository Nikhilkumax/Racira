const fs = require('fs');
const path = require('path');

const NEXTJS_DIR = __dirname;
const ROOT_DIR = path.dirname(NEXTJS_DIR); // c:\Racira
const QUAR_DIR = path.join(ROOT_DIR, 'racira-quarantine');
const OLD_ARCHIVE_DIR = path.join(NEXTJS_DIR, 'archive');

const FOLDERS = {
  reports: path.join(QUAR_DIR, 'reports'),
  oldDatabases: path.join(QUAR_DIR, 'old-databases'),
  migrationScripts: path.join(QUAR_DIR, 'migration-scripts'),
  logs: path.join(QUAR_DIR, 'logs'),
  scratch: path.join(QUAR_DIR, 'scratch'),
  temporaryTools: path.join(QUAR_DIR, 'temporary-tools'),
  archivedUtilities: path.join(QUAR_DIR, 'archived-utilities')
};

// Create quarantine folders
if (!fs.existsSync(QUAR_DIR)) fs.mkdirSync(QUAR_DIR);
for (const folder of Object.values(FOLDERS)) {
  if (!fs.existsSync(folder)) fs.mkdirSync(folder);
}

const movedFiles = [];

function moveFile(srcPath, destFolder, category, reason) {
  if (fs.existsSync(srcPath)) {
    const fileName = path.basename(srcPath);
    const destPath = path.join(destFolder, fileName);
    fs.renameSync(srcPath, destPath);
    
    // Relative paths for manifest
    const origRel = srcPath.replace(ROOT_DIR, '').replace(/^[\\\/]/, '').replace(/\\/g, '/');
    const destRel = destPath.replace(ROOT_DIR, '').replace(/^[\\\/]/, '').replace(/\\/g, '/');
    
    movedFiles.push({
      name: fileName,
      original: origRel,
      destination: destRel,
      category,
      reason
    });
  }
}

// 1. Move everything already inside NEXTJS_DIR/archive
if (fs.existsSync(OLD_ARCHIVE_DIR)) {
  const categories = ['reports', 'old-databases', 'migration-scripts', 'logs', 'temporary-files'];
  categories.forEach(cat => {
    const catPath = path.join(OLD_ARCHIVE_DIR, cat);
    if (fs.existsSync(catPath)) {
      fs.readdirSync(catPath).forEach(f => {
        let targetFolder = FOLDERS.reports;
        if (cat === 'old-databases') targetFolder = FOLDERS.oldDatabases;
        else if (cat === 'migration-scripts') targetFolder = FOLDERS.migrationScripts;
        else if (cat === 'logs') targetFolder = FOLDERS.logs;
        else if (cat === 'temporary-files') targetFolder = FOLDERS.temporaryTools;

        moveFile(path.join(catPath, f), targetFolder, cat, `Previously archived ${cat}`);
      });
    }
  });
}

// 2. Identify remaining Safe to Delete candidates in NEXTJS_DIR (Root scripts)
const KEEP = [
  'package.json', 'package-lock.json', 'next.config.mjs',
  'tailwind.config.ts', 'postcss.config.js', 'tsconfig.json',
  'vercel.json', 'next-env.d.ts', 'README.md',
  'build_master_database.js', 'Calculator_Database_Final.json',
  'execute_quarantine.js', 'post_quarantine_validation.md'
];

fs.readdirSync(NEXTJS_DIR).forEach(f => {
  const fullPath = path.join(NEXTJS_DIR, f);
  if (!fs.statSync(fullPath).isFile()) return;
  if (KEEP.includes(f)) return;

  if (f.endsWith('.md')) {
    moveFile(fullPath, FOLDERS.reports, 'reports', 'Audit or cleanup report');
  } else if (f.endsWith('.js') || f.endsWith('.ts') || f.endsWith('.ps1') || f.endsWith('.py')) {
    moveFile(fullPath, FOLDERS.archivedUtilities, 'archived-utilities', 'Root utility or temporary script');
  } else if (f.endsWith('.json')) {
    moveFile(fullPath, FOLDERS.oldDatabases, 'old-databases', 'Root JSON dump or database');
  }
});

// 3. Move contents of NEXTJS_DIR/scratch
const SCRATCH = path.join(NEXTJS_DIR, 'scratch');
if (fs.existsSync(SCRATCH)) {
  fs.readdirSync(SCRATCH).forEach(f => {
    moveFile(path.join(SCRATCH, f), FOLDERS.scratch, 'scratch', 'Scratch workspace file');
  });
}

// 4. Move contents of NEXTJS_DIR/scripts (excluding anything we want to keep, but user said move them)
const SCRIPTS = path.join(NEXTJS_DIR, 'scripts');
if (fs.existsSync(SCRIPTS)) {
  fs.readdirSync(SCRIPTS).forEach(f => {
    moveFile(path.join(SCRIPTS, f), FOLDERS.temporaryTools, 'temporary-tools', 'Ad-hoc development script');
  });
}

// Cleanup empty folders in NEXTJS_DIR
try {
  if (fs.existsSync(SCRATCH)) fs.rmdirSync(SCRATCH);
  if (fs.existsSync(SCRIPTS)) fs.rmdirSync(SCRIPTS);
  if (fs.existsSync(path.join(OLD_ARCHIVE_DIR, 'reports'))) fs.rmdirSync(path.join(OLD_ARCHIVE_DIR, 'reports'));
  if (fs.existsSync(path.join(OLD_ARCHIVE_DIR, 'old-databases'))) fs.rmdirSync(path.join(OLD_ARCHIVE_DIR, 'old-databases'));
  if (fs.existsSync(path.join(OLD_ARCHIVE_DIR, 'migration-scripts'))) fs.rmdirSync(path.join(OLD_ARCHIVE_DIR, 'migration-scripts'));
  if (fs.existsSync(path.join(OLD_ARCHIVE_DIR, 'logs'))) fs.rmdirSync(path.join(OLD_ARCHIVE_DIR, 'logs'));
  if (fs.existsSync(path.join(OLD_ARCHIVE_DIR, 'temporary-files'))) fs.rmdirSync(path.join(OLD_ARCHIVE_DIR, 'temporary-files'));
  if (fs.existsSync(OLD_ARCHIVE_DIR)) fs.rmdirSync(OLD_ARCHIVE_DIR);
} catch (e) {
  // Ignore rmdir errors if directories aren't empty (though they should be)
}

// 5. Generate Manifest
let manifest = `# Quarantine Manifest\n\n*Generated: ${new Date().toISOString()}*\n\n`;

const counts = {
  reports: 0,
  databases: 0,
  scripts: 0,
  logs: 0,
  scratch: 0,
  tools: 0
};

movedFiles.forEach(m => {
  if (m.destination.includes('/reports/')) counts.reports++;
  else if (m.destination.includes('/old-databases/')) counts.databases++;
  else if (m.destination.includes('/migration-scripts/') || m.destination.includes('/archived-utilities/')) counts.scripts++;
  else if (m.destination.includes('/logs/')) counts.logs++;
  else if (m.destination.includes('/scratch/')) counts.scratch++;
  else if (m.destination.includes('/temporary-tools/')) counts.tools++;
});

manifest += `## Summary\n| Category | Count |\n|---|---|\n`;
manifest += `| Reports Moved | ${counts.reports} |\n`;
manifest += `| Databases Moved | ${counts.databases} |\n`;
manifest += `| Scripts Moved | ${counts.scripts} |\n`;
manifest += `| Logs Moved | ${counts.logs} |\n`;
manifest += `| Scratch Files Moved | ${counts.scratch} |\n`;
manifest += `| Temporary Tools Moved | ${counts.tools} |\n`;
manifest += `| **Total Files Moved** | **${movedFiles.length}** |\n\n`;

manifest += `## Quarantined Files\n| File Name | Original Location | New Location | Reason Moved |\n|---|---|---|---|\n`;
movedFiles.forEach(m => {
  manifest += `| \`${m.name}\` | \`${m.original}\` | \`${m.destination}\` | ${m.reason} |\n`;
});

fs.writeFileSync(path.join(QUAR_DIR, 'quarantine_manifest.md'), manifest);
console.log('✅ Generated quarantine_manifest.md');
