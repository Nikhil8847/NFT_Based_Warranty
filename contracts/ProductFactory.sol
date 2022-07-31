//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./Product.sol";

error ProductFactory__NotSeller();
error ProductFactory__ProductNotValid();

/**
 *@title ProductFactory
 *@author Nikhil
 *@notice contract is not properly test, just basic testing has been done
 */
contract ProductFactory {
    /* Events */
    /**
     *@dev This event emitted when a new product is added to products list. useful to keep track the products
     offchain
    */
    event ProductAdded(
        address indexed productAddress,
        uint256 indexed time,
        uint256 indexed warrantyPeriod
    );
    /**
     *@dev This event emitted when an existing product is deleted from the products list
     */
    event ProductDeleted(address indexed productAddress, uint256 indexed time);

    /* ProductFactory State variables */
    Product[] private products;
    address private FactoryOwner;
    uint256 private s_productIndex;
    mapping(address => uint256) private s_addressToProductIndex;
    mapping(address => bool) private s_isProductAvailable;

    /**
     *@dev Modifers are implemented in this section, Revert if the caller address is not same as
     address of the product adder
     */
    modifier haveDeleteAccess(address caller, address productAddress) {
        if (products[s_addressToProductIndex[productAddress]].getSeller() != caller) {
            revert ProductFactory__NotSeller();
        }
        _;
    }

    modifier isProductAvailable(address productAddress) {
        if (s_isProductAvailable[productAddress] == false) {
            revert ProductFactory__ProductNotValid();
        }
        _;
    }

    /**
     *@dev The actual function for interacting with ProductFactory Contract
     */
    constructor() {
        FactoryOwner = msg.sender;
        s_productIndex = 0;
    }

    /**
     *@dev Create a product and add it to the list "products",
     *@param name_ name of the prouduct.
     *@param symbol_ not necessarily needed(just provided in case, if not made something default explicity)
     *@param warrantyPeriod_ the timeInterval for the warranty to be available on the product
     *@param quantity_ the quantity of the product seller is selling
     *@param ProductURI the takenURI of the metadata file of a product(metadata generated, when a seller add products of its details)
     */
    function addProduct(
        string memory name_,
        string memory symbol_,
        uint256 warrantyPeriod_,
        uint256 quantity_,
        string memory ProductURI
    ) external {
        Product product = new Product(
            address(msg.sender),
            name_,
            symbol_,
            warrantyPeriod_,
            quantity_,
            ProductURI
        );
        products.push(product);
        s_addressToProductIndex[address(product)] = s_productIndex;
        s_isProductAvailable[address(product)] = true;
        emit ProductAdded(address(product), block.timestamp, warrantyPeriod_);
        s_productIndex++;
    }

    /**
     *@notice Some basic getter functions, Name implies the functionality
     *@dev These functions facilitates the process of fetching data from contract to front end
     */
    function getNumberOfProducts() public view returns (uint256) {
        return s_productIndex;
    }

    function getFactoryOwner() public view returns (address) {
        return FactoryOwner;
    }

    function getProductName(address productAddress)
        public
        view
        isProductAvailable(productAddress)
        returns (string memory)
    {
        return products[s_addressToProductIndex[productAddress]].name();
    }

    function getProductSymbol(address productAddress)
        public
        view
        isProductAvailable(productAddress)
        returns (string memory)
    {
        return products[s_addressToProductIndex[productAddress]].symbol();
    }

    function getWarrantyPeriod(address productAddress)
        public
        view
        isProductAvailable(productAddress)
        returns (uint256)
    {
        return products[s_addressToProductIndex[productAddress]].getWarrantyPeriod();
    }

    /**
     *@dev Create a product and add it to the list "products",
     *@param productAddress name of the prouduct.
     *@param tokenID not necessarily needed(just provided in case, if not made something default explicity)
     */
    function getProductURI(address productAddress, uint256 tokenID)
        public
        view
        isProductAvailable(productAddress)
        returns (string memory)
    {
        uint256 index = s_addressToProductIndex[productAddress];
        return products[index].tokenURI(tokenID);
    }

    // function getProductAtAddress(address productAddress)
    //     public
    //     view
    //     isProductAvailable(productAddress)
    //     returns (Product)
    // {
    //     return products[s_addressToProductIndex[productAddress]];
    // }

    /**
     *@dev This method is not particularly useful in the contract usefulnees.
     Only implemented for the testing purposes
     @param productIndex index of the product in the product list
     */
    function getProductAtIndex(uint256 productIndex) public view returns (Product) {
        if (productIndex < 0 || productIndex >= s_productIndex) {
            revert ProductFactory__ProductNotValid();
        }
        return products[productIndex];
    }

    /**
     *@dev deletes the Product at productAddress(basically the NFT at productAddress) fromt the list products.
            Method used is fetch the index of productAddress in products list and swap it with last product in the list
            and delete the last.
            (This method is used to avoid shifting of the preceding products to previous indices)
     *@param productAddress the address of the product NFT deployed by a seller
     */
    function deleteProduct(address productAddress)
        external
        haveDeleteAccess(address(msg.sender), productAddress)
        isProductAvailable(productAddress)
    {
        uint256 productIndex = s_addressToProductIndex[productAddress];
        uint256 lastIndex = s_productIndex - 1;
        Product lastProduct = products[lastIndex];
        products[productIndex] = lastProduct;
        s_addressToProductIndex[address(lastProduct)] = productIndex;
        s_isProductAvailable[address(lastProduct)] = false;
        delete products[lastIndex];
        s_productIndex--;
        emit ProductDeleted(address(lastProduct), block.timestamp);
    }
}
