import User from './User.js';
import Address from './Address.js';
import Books from './Books.js';
import Purchases from './Purchases.js';
import PurchaseItems from './PurchaseItems.js';
import Cart from './Cart.js';
import NF from './NF.js';
import CardsSaved from './CardsSaved.js';
import Image from './Image.js';

/**
 * ASSOCIAÇÕES ENTRE MODELOS
 * 
 * Este arquivo define todos os relacionamentos entre os modelos.
 * É importante definir as associações para que o Sequelize possa
 * fazer joins e consultas relacionais automaticamente.
 */

export function defineAssociations() {
  console.log('🔗 Definindo associações entre modelos...');

  // ===== RELACIONAMENTOS USER =====
  
  // User -> Address (Um usuário pode ter vários endereços)
  User.hasMany(Address, {
    foreignKey: 'userId',
    as: 'addresses',           // Nome do relacionamento
    onDelete: 'CASCADE',       // Se usuário for deletado, deleta endereços
    onUpdate: 'CASCADE'        // Se ID do usuário mudar, atualiza endereços
  });

  // Address -> User (Um endereço pertence a um usuário)
  Address.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
  });

  // User -> Purchases (Um usuário pode ter vários pedidos)
  User.hasMany(Purchases, {
    foreignKey: 'userId',
    as: 'purchases',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  // Purchases -> User (Um pedido pertence a um usuário)
  Purchases.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
  });

  // User -> Cart (Um usuário pode ter um carrinho ativo)
  User.hasOne(Cart, {
    foreignKey: 'userId',
    as: 'cart',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  // Cart -> User (Um carrinho pertence a um usuário)
  Cart.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
  });

  // User -> CardsSaved (Um usuário pode ter vários cartões salvos)
  User.hasMany(CardsSaved, {
    foreignKey: 'userId',
    as: 'savedCards',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  // CardsSaved -> User (Um cartão salvo pertence a um usuário)
  CardsSaved.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
  });

  // ===== RELACIONAMENTOS PURCHASES =====
  
  // Purchases -> Address (Um pedido pode ter um endereço de entrega)
  Purchases.belongsTo(Address, {
    foreignKey: 'addressId',
    as: 'deliveryAddress'
  });

  // Address -> Purchases (Um endereço pode estar em vários pedidos)
  Address.hasMany(Purchases, {
    foreignKey: 'addressId',
    as: 'purchases'
  });

  // Purchases -> PurchaseItems (Um pedido pode ter vários itens)
  Purchases.hasMany(PurchaseItems, {
    foreignKey: 'purchaseId',
    as: 'items',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  // PurchaseItems -> Purchases (Um item pertence a um pedido)
  PurchaseItems.belongsTo(Purchases, {
    foreignKey: 'purchaseId',
    as: 'purchase'
  });

  // Purchases -> NF (Um pedido pode ter uma nota fiscal)
  Purchases.hasOne(NF, {
    foreignKey: 'purchaseId',
    as: 'notaFiscal',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  // NF -> Purchases (Uma nota fiscal pertence a um pedido)
  NF.belongsTo(Purchases, {
    foreignKey: 'purchaseId',
    as: 'purchase'
  });

  // ===== RELACIONAMENTOS BOOKS =====
  
  // Books -> PurchaseItems (Um livro pode estar em vários itens de pedido)
  Books.hasMany(PurchaseItems, {
    foreignKey: 'bookId',
    as: 'purchaseItems'
  });

  // PurchaseItems -> Books (Um item de pedido pertence a um livro)
  PurchaseItems.belongsTo(Books, {
    foreignKey: 'bookId',
    as: 'book'
  });

  // ===== RELACIONAMENTOS ESPECIAIS =====
  
  // User -> Books (através de PurchaseItems) - Livros comprados por um usuário
  User.belongsToMany(Books, {
    through: PurchaseItems,
    foreignKey: 'purchaseId',
    otherKey: 'bookId',
    as: 'purchasedBooks'
  });

  // Books -> User (através de PurchaseItems) - Usuários que compraram um livro
  Books.belongsToMany(User, {
    through: PurchaseItems,
    foreignKey: 'bookId',
    otherKey: 'purchaseId',
    as: 'buyers'
  });

  // User -> Books (através de Cart) - Livros no carrinho do usuário
  User.belongsToMany(Books, {
    through: Cart,
    foreignKey: 'userId',
    otherKey: 'bookId',
    as: 'cartBooks'
  });

  // Books -> User (através de Cart) - Usuários que têm o livro no carrinho
  Books.belongsToMany(User, {
    through: Cart,
    foreignKey: 'bookId',
    otherKey: 'userId',
    as: 'cartUsers'
  });

  // ===== RELACIONAMENTOS IMAGE =====
  
  // User -> Image (Um usuário pode ter várias imagens - avatar, etc.)
  User.hasMany(Image, {
    foreignKey: 'uploadedBy',
    as: 'uploadedImages',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  });

  // Image -> User (Uma imagem pode ter sido enviada por um usuário)
  Image.belongsTo(User, {
    foreignKey: 'uploadedBy',
    as: 'uploader'
  });

  // Books -> Image (Um livro pode ter várias imagens - capa, verso, galeria)
  Books.hasMany(Image, {
    foreignKey: 'entityId',
    scope: { entityType: 'book' },
    as: 'images',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  // Image -> Books (Uma imagem pode pertencer a um livro)
  Image.belongsTo(Books, {
    foreignKey: 'entityId',
    scope: { entityType: 'book' },
    as: 'book'
  });

  console.log('✅ Associações definidas com sucesso!');
}

/**
 * EXEMPLOS DE USO DAS ASSOCIAÇÕES
 * 
 * Com essas associações definidas, você pode fazer consultas como:
 * 
 * // Buscar usuário com todos os endereços
 * const user = await User.findOne({
 *   where: { id: 1 },
 *   include: [{ model: Address, as: 'addresses' }]
 * });
 * 
 * // Buscar pedido com itens e livros
 * const purchase = await Purchases.findOne({
 *   where: { id: 1 },
 *   include: [
 *     { model: User, as: 'user' },
 *     { model: Address, as: 'deliveryAddress' },
 *     { 
 *       model: PurchaseItems, 
 *       as: 'items',
 *       include: [{ model: Books, as: 'book' }]
 *     }
 *   ]
 * });
 * 
 * // Buscar livros comprados por um usuário
 * const user = await User.findOne({
 *   where: { id: 1 },
 *   include: [{ model: Books, as: 'purchasedBooks' }]
 * });
 * 
 * // Buscar usuários que compraram um livro
 * const book = await Books.findOne({
 *   where: { id: 1 },
 *   include: [{ model: User, as: 'buyers' }]
 * });
 * 
 * // Buscar carrinho do usuário
 * const user = await User.findOne({
 *   where: { id: 1 },
 *   include: [{ model: Cart, as: 'cart' }]
 * });
 * 
 * // Buscar cartões salvos do usuário
 * const user = await User.findOne({
 *   where: { id: 1 },
 *   include: [{ model: CardsSaved, as: 'savedCards' }]
 * });
 * 
 * // Buscar pedido com nota fiscal
 * const purchase = await Purchases.findOne({
 *   where: { id: 1 },
 *   include: [{ model: NF, as: 'notaFiscal' }]
 * });
 */

export default defineAssociations;
