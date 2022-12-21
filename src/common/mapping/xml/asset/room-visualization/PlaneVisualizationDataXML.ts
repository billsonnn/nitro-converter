import { PlaneMaterialXML } from './material';
import { PlaneXML } from './PlaneXML';
import { PlaneTextureXML } from './texture';

export class PlaneVisualizationDataXML
{
    private readonly _planes: PlaneXML[];
    private readonly _materials: PlaneMaterialXML[];
    private readonly _textures: PlaneTextureXML[];

    constructor(xml: any)
    {
        const attributes = xml.$;

        if ((xml.walls !== undefined) && Array.isArray(xml.walls))
        {
            this._planes = [];

            for (const wallParent of xml.walls)
            {
                if (Array.isArray(wallParent.wall)) for (const wall of wallParent.wall) this._planes.push(new PlaneXML(wall));
            }
        }

        else if ((xml.floors !== undefined) && Array.isArray(xml.floors))
        {
            this._planes = [];

            for (const floorParent of xml.floors)
            {
                if (Array.isArray(floorParent.floor)) for (const floor of floorParent.floor) this._planes.push(new PlaneXML(floor));
            }
        }

        else if ((xml.landscapes !== undefined) && Array.isArray(xml.landscapes))
        {
            this._planes = [];

            for (const landscapeParent of xml.landscapes)
            {
                if (Array.isArray(landscapeParent.landscape)) for (const landscape of landscapeParent.landscape) this._planes.push(new PlaneXML(landscape));
            }
        }

        if ((xml.materials !== undefined) && Array.isArray(xml.materials))
        {
            this._materials = [];

            for (const materialParent of xml.materials)
            {
                if (Array.isArray(materialParent.material)) for (const material of materialParent.material) this._materials.push(new PlaneMaterialXML(material));
            }
        }

        if ((xml.textures !== undefined) && Array.isArray(xml.textures))
        {
            this._textures = [];

            for (const textureParent of xml.textures)
            {
                if (Array.isArray(textureParent.texture)) for (const texture of textureParent.texture) this._textures.push(new PlaneTextureXML(texture));
            }
        }
    }

    public get planes(): PlaneXML[]
    {
        return this._planes;
    }

    public get materials(): PlaneMaterialXML[]
    {
        return this._materials;
    }

    public get textures(): PlaneTextureXML[]
    {
        return this._textures;
    }
}
