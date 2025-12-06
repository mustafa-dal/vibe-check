
'use server';

interface FileNode {
    path: string;
    type: 'blob' | 'tree';
    url: string; // URL to fetch content
}

interface ScanResult {
    files: { path: string; content: string }[];
    error?: string;
    totalFilesScanned: number;
}

const IGNORED_FOLDERS = [
    'node_modules',
    '.git',
    '.next',
    'dist',
    'build',
    'public',
    'coverage',
    '.vercel',
    '.vscode'
];

const IGNORED_FILES = [
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
    '.DS_Store',
    '.env',
    '.env.local',
    '.gitignore'
];

const ALLOWED_EXTENSIONS = [
    // JS/TS
    '.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs',
    // Python
    '.py',
    // Database
    '.sql', '.prisma',
    // Config/Data
    '.json', '.yaml', '.yml', '.toml',
    // Ops
    'Dockerfile', 'docker-compose.yml'
];

function isAllowed(path: string): boolean {
    const parts = path.split('/');

    // Check if any folder in the path is ignored
    for (const part of parts) {
        if (IGNORED_FOLDERS.includes(part)) return false;
    }

    const filename = parts[parts.length - 1];

    // Check specific excluded files
    if (IGNORED_FILES.includes(filename)) return false;

    // Check extensions (unless it's a specific allowed file like Dockerfile)
    if (ALLOWED_EXTENSIONS.some(ext => filename === ext)) return true; // Exact match for things like Dockerfile if added to list

    const hasAllowedExtension = ALLOWED_EXTENSIONS.some(ext => filename.endsWith(ext));
    // Special handling for exact matches in allowed extensions if they aren't dot-prefixed (like Dockerfile)
    const isExactMatch = ALLOWED_EXTENSIONS.includes(filename);

    return hasAllowedExtension || isExactMatch;
}

export async function fetchGithubRepo(repoUrl: string): Promise<ScanResult> {
    console.log('Fetching repo:', repoUrl);
    try {
        // 1. Parse URL
        // Expected format: https://github.com/owner/repo
        const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
        if (!match) {
            return { files: [], totalFilesScanned: 0, error: "Invalid GitHub URL" };
        }
        const [, owner, repo] = match;

        // 2. Get Default Branch (usually main or master)
        const repoInfoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
        if (!repoInfoRes.ok) {
            return { files: [], totalFilesScanned: 0, error: "Repository not found or private." };
        }
        const repoInfo = await repoInfoRes.json();
        const defaultBranch = repoInfo.default_branch;

        // 3. Get the Tree (Recursive)
        // Note: Recursive tree fetch has a limit of 100,000 entries, plenty for MVP.
        const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`;
        const treeRes = await fetch(treeUrl);
        if (!treeRes.ok) {
            return { files: [], totalFilesScanned: 0, error: "Failed to fetch file tree." };
        }
        const treeData = await treeRes.json();

        if (treeData.truncated) {
            // Warning: repo too big
            console.warn("Repo tree truncated");
        }

        // 4. Filter Files
        const allNodes: FileNode[] = treeData.tree;
        const validFiles = allNodes.filter(node =>
            node.type === 'blob' && isAllowed(node.path)
        );

        // 5. Fetch Content (Limit to ~20 files for MVP fairness/speed if needed, or fetch all small ones)
        // For MVP, let's fetch up to 30 valid files to keep it fast.
        const filesToFetch = validFiles.slice(0, 30);

        const fileContents = await Promise.all(filesToFetch.map(async (node) => {
            // Use raw.githubusercontent.com for raw content to avoid API base64 decoding hassle
            const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/${node.path}`;
            const res = await fetch(rawUrl);
            if (!res.ok) return null;
            const text = await res.text();
            return {
                path: node.path,
                content: text
            };
        }));

        console.log('Files found:', validFiles.length);

        return {
            files: fileContents.filter((f): f is { path: string, content: string } => f !== null),
            totalFilesScanned: validFiles.length
        };

    } catch (e) {
        console.error("Scan Error:", e);
        return { files: [], totalFilesScanned: 0, error: "Failed to scan repository." };
    }
}
