import { IAssetData, IPlanetSystem } from '../../json';
import { IParticleSystem, IParticleSystemEmitter, IParticleSystemParticle, IParticleSystemSimulation } from '../../json/asset/particlesystem';
import { LogicXML, ParticleSystemEmitterXML, ParticleSystemObjectXML, ParticleSystemParticleXML, ParticleSystemSimulationXML, PlanetSystemObjectXML } from '../../xml';
import { Mapper } from './Mapper';

export class LogicMapper extends Mapper
{
    public static mapXML(logic: any, output: IAssetData): void
    {
        if(!logic || !output) return;

        LogicMapper.mapLogicXML(new LogicXML(logic.objectData), output);
    }

    private static mapLogicXML(xml: LogicXML, output: IAssetData): void
    {
        if(!xml || !output) return;

        if(xml.model !== undefined)
        {
            if(xml.model.dimensions !== undefined)
            {
                output.dimensions = {
                    x: xml.model.dimensions.x,
                    y: xml.model.dimensions.y,
                    z: xml.model.dimensions.z
                };
            }

            if(xml.model.directions !== undefined)
            {
                const directions: number[] = [];

                if(!xml.model.directions.length)
                {
                    directions.push(0);
                }
                else
                {
                    for(const direction of xml.model.directions) directions.push(parseInt(direction.id.toString()));
                }

                output.directions = directions;
            }
        }

        if(xml.action !== undefined)
        {
            if(xml.action.link !== undefined)
            {
                if(!output.action) output.action = {};

                output.action.link = xml.action.link;
            }

            if(xml.action.startState !== undefined)
            {
                if(!output.action) output.action = {};

                output.action.startState = xml.action.startState;
            }
        }

        if(xml.mask !== undefined) output.maskType = xml.mask.type;

        if(xml.credits !== undefined) output.credits = xml.credits.value;

        if(xml.soundSample !== undefined)
        {
            output.soundSample = {
                id: xml.soundSample.id,
                noPitch: xml.soundSample.noPitch
            };
        }

        if(xml.planetSystem !== undefined)
        {
            if(!output.planetSystems)
            {
                output.planetSystems = [];
            }

            if(xml.planetSystem.objects !== undefined) LogicMapper.mapPlanetSystemXML(xml.planetSystem.objects, output.planetSystems);
        }

        if(xml.particleSystem !== undefined)
        {
            if(!output.particleSystems)
            {
                output.particleSystems = [];
            }

            if(xml.particleSystem.objects !== undefined) LogicMapper.mapParticleSystemXML(xml.particleSystem.objects, output.particleSystems);
        }
    }

    private static mapPlanetSystemXML(xml: PlanetSystemObjectXML[], output: IPlanetSystem[]): void
    {
        if(!xml || !xml.length || !output) return;

        for(const planetSystemObjectXML of xml)
        {
            const planetObject: IPlanetSystem = {};

            if(planetSystemObjectXML.id !== undefined) planetObject.id = planetSystemObjectXML.id;
            if(planetSystemObjectXML.name !== undefined) planetObject.name = planetSystemObjectXML.name;
            if(planetSystemObjectXML.parent !== undefined) planetObject.parent = planetSystemObjectXML.parent;
            if(planetSystemObjectXML.radius !== undefined) planetObject.radius = planetSystemObjectXML.radius;
            if(planetSystemObjectXML.arcSpeed !== undefined) planetObject.arcSpeed = planetSystemObjectXML.arcSpeed;
            if(planetSystemObjectXML.arcOffset !== undefined) planetObject.arcOffset = planetSystemObjectXML.arcOffset;
            if(planetSystemObjectXML.blend !== undefined) planetObject.blend = planetSystemObjectXML.blend;
            if(planetSystemObjectXML.height !== undefined) planetObject.height = planetSystemObjectXML.height;

            output.push(planetObject);
        }
    }

    private static mapParticleSystemXML(xml: ParticleSystemObjectXML[], output: IParticleSystem[]): void
    {
        if(!xml || !xml.length || !output) return;

        for(const particleSystemXML of xml)
        {
            const particleObject: IParticleSystem = {};

            if(particleSystemXML.size !== undefined) particleObject.size = particleSystemXML.size;
            if(particleSystemXML.canvasId !== undefined) particleObject.canvasId = particleSystemXML.canvasId;
            if(particleSystemXML.offsetY !== undefined) particleObject.offsetY = particleSystemXML.offsetY;
            if(particleSystemXML.blend !== undefined) particleObject.blend = particleSystemXML.blend;
            if(particleSystemXML.bgColor !== undefined) particleObject.bgColor = particleSystemXML.bgColor;

            if(particleSystemXML.emitters !== undefined)
            {
                if(particleSystemXML.emitters.length)
                {
                    particleObject.emitters = [];

                    LogicMapper.mapParticleSystemEmitterXML(particleSystemXML.emitters, particleObject.emitters);
                }
            }

            output.push(particleObject);
        }
    }

    private static mapParticleSystemEmitterXML(xml: ParticleSystemEmitterXML[], output: IParticleSystemEmitter[]): void
    {
        if(!xml || !xml.length || !output) return;

        for(const particleSystemEmitterXML of xml)
        {
            const particleEmitter: IParticleSystemEmitter = {};

            if(particleSystemEmitterXML.id !== undefined) particleEmitter.id = particleSystemEmitterXML.id;
            if(particleSystemEmitterXML.name !== undefined) particleEmitter.name = particleSystemEmitterXML.name;
            if(particleSystemEmitterXML.spriteId !== undefined) particleEmitter.spriteId = particleSystemEmitterXML.spriteId;
            if(particleSystemEmitterXML.maxNumParticles !== undefined) particleEmitter.maxNumParticles = particleSystemEmitterXML.maxNumParticles;
            if(particleSystemEmitterXML.particlesPerFrame !== undefined) particleEmitter.particlesPerFrame = particleSystemEmitterXML.particlesPerFrame;
            if(particleSystemEmitterXML.burstPulse !== undefined) particleEmitter.burstPulse = particleSystemEmitterXML.burstPulse;
            if(particleSystemEmitterXML.fuseTime !== undefined) particleEmitter.fuseTime = particleSystemEmitterXML.fuseTime;

            if(particleSystemEmitterXML.simulation !== undefined)
            {
                particleEmitter.simulation = {};

                LogicMapper.mapParticleSystemSimulationXML(particleSystemEmitterXML.simulation, particleEmitter.simulation);
            }

            if(particleSystemEmitterXML.particles !== undefined)
            {
                if(particleSystemEmitterXML.particles.length)
                {
                    particleEmitter.particles = [];

                    LogicMapper.mapParticleSystemParticleXML(particleSystemEmitterXML.particles, particleEmitter.particles);
                }
            }

            output.push(particleEmitter);
        }
    }

    private static mapParticleSystemSimulationXML(xml: ParticleSystemSimulationXML, output: IParticleSystemSimulation): void
    {
        if(!xml || !output) return;

        if(xml.force !== undefined) output.force = xml.force;
        if(xml.direction !== undefined) output.direction = xml.direction;
        if(xml.gravity !== undefined) output.gravity = xml.gravity;
        if(xml.airFriction !== undefined) output.airFriction = xml.airFriction;
        if(xml.shape !== undefined) output.shape = xml.shape;
        if(xml.energy !== undefined) output.energy = xml.energy;
    }

    private static mapParticleSystemParticleXML(xml: ParticleSystemParticleXML[], output: IParticleSystemParticle[]): void
    {
        if(!xml || !xml.length || !output) return;

        for(const particleSystemParticleXML of xml)
        {
            const particle: IParticleSystemParticle = {};

            if(particleSystemParticleXML.isEmitter !== undefined) particle.isEmitter = particleSystemParticleXML.isEmitter;
            if(particleSystemParticleXML.lifeTime !== undefined) particle.lifeTime = particleSystemParticleXML.lifeTime;
            if(particleSystemParticleXML.fade !== undefined) particle.fade = particleSystemParticleXML.fade;

            if(particleSystemParticleXML.frames !== undefined)
            {
                if(particleSystemParticleXML.frames.length)
                {
                    particle.frames = particleSystemParticleXML.frames;
                }
            }

            output.push(particle);
        }
    }
}
