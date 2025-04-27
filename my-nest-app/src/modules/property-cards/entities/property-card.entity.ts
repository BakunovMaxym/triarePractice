import { UseDto } from "../../../decorators/use-dto.decorator";
import { Column, Entity, ManyToOne, type Relation } from "typeorm";
import { PropertyCardDto } from "../dto/property-card.dto";
import { AbstractEntity } from "../../../common/abstract.entity";
import { ColectionEntity } from "../../../modules/colections/colection.entity";
import { PropertyType } from "../PropertyType";

@Entity({ name: 'property_cards' })
@UseDto(PropertyCardDto)
export class PropertyCardEntity extends AbstractEntity<PropertyCardDto>{

    @ManyToOne (() => ColectionEntity, (colection) => colection.propertyCards)
    colection!: Relation<ColectionEntity>;

    @Column({nullable: false , type: 'varchar'})
    name!: string;

    @Column({nullable: false, type: 'enum', enum: PropertyType, default: PropertyType.STANDART})
    type!: PropertyType;

    @Column({nullable:false , type: 'integer'})
    price!: number;

    @Column({nullable:false , type: 'varchar'})
    street!: string;

    @Column({nullable: true , type: 'integer'})
    upgradePrice!: number;

    @Column({nullable: false, type: 'integer'})
    rent!: number;

    @Column({nullable: true, type: 'integer'})
    rentAllStreet!: number;

    @Column({nullable:true , type: 'integer'})
    rentWithOneHouse!: number;

    @Column({nullable: true, type: 'integer'})
    rentWithTwoHouse!: number;


    @Column({nullable: true, type: 'integer'})
    rentWithThreeHouse!: number;

    @Column({nullable: true, type: 'integer'})
    rentWithFourHouse!: number;

    @Column({nullable: true, type: 'integer'})
    rentWithHotel!: number;



}
