// Figma-side extractor for the parity gate. Run once per page through the plugin
// channel (the Figma MCP `use_figma` tool), then merge the results into
// figma/components.json.
//
// Why a manual channel and not an API call in CI: the REST API does not expose Variables
// or component property definitions on this plan, and Code Connect — the supported way to
// bind Figma components to code — requires an Organization or Enterprise plan. The plugin
// channel is the same route the token snapshot uses.
//
// Usage: substitute PAGE_ID and run. One page per call — switching pages more than once
// in a single script reloads the file and is slow.

const PAGE_ID = '0:1';

const page = await figma.getNodeByIdAsync(PAGE_ID);
await figma.setCurrentPageAsync(page);

const nodes = page.findAllWithCriteria({ types: ['COMPONENT', 'COMPONENT_SET'] });

// A variant inside a COMPONENT_SET is not its own entry — the set owns the properties.
const roots = nodes.filter((n) => !(n.parent && n.parent.type === 'COMPONENT_SET'));

const components = {};
for (const n of roots) {
  const defs = n.componentPropertyDefinitions || {};
  const properties = {};
  for (const [rawKey, def] of Object.entries(defs)) {
    properties[rawKey] = {
      type: def.type,
      ...(def.variantOptions ? { variantOptions: def.variantOptions } : {}),
      ...(def.defaultValue !== undefined ? { defaultValue: def.defaultValue } : {}),
    };
  }
  components[n.name] = {
    nodeId: n.id,
    type: n.type,
    page: page.name,
    description: n.description || '',
    properties,
  };
}

return { page: page.name, pageId: page.id, count: Object.keys(components).length, components };
