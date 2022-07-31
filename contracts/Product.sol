// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

error Product__WithdrawFailed();
error Product__InvalidTokenId();
error Product__OutOfStock();
error Product__InvalidAccess();
error Product__Repairing();

/**
 *@title Concrete Product Warranty NFT
 *@author Nikhil
 *@notice The contract simulate the warranty feature of a Product
 */
contract Product is ERC721URIStorage {
    /* types */
    using Counters for Counters.Counter;
    Counters.Counter private s_tokenIds;
    enum warrantyState {
        outOfWarranty,
        Repairing,
        Replaced,
        inWarranty
    }
    /* State Variables */
    address private immutable i_seller;
    uint256 private s_warrantyPeriod;
    uint256 private s_quantity;
    /**
     *@dev s_productURI can be same for each nft minted for any buyer
     reason the properties of an hard product is almost same
     (feature may be depreciated according to needs)
    */
    string private s_productURI;
    mapping(uint256 => uint256) private s_buyingTime;
    mapping(uint256 => bool) private s_tokenIdValid;
    mapping(uint256 => warrantyState) private warrantyStatus;
    /* Events */
    event ProductBought(uint256 indexed buyingTime, uint256 indexed expiryTime);

    modifier checkTokenId(uint256 tokenId) {
        if (s_tokenIdValid[tokenId] == false) {
            revert Product__InvalidTokenId();
        }
        _;
    }

    modifier stockAvailable() {
        if (s_quantity == 0) {
            revert Product__OutOfStock();
        }
        _;
    }

    modifier onlyOwner(address caller_) {
        if (i_seller != caller_) {
            revert Product__InvalidAccess();
        }
        _;
    }

    /**
     *@dev Constructor only creates NFT, doesn't handle minting(when someone actually buy a product) aspect
     *@param seller is the address of account who called "addProduct" function in ProductFactory contract
     *@param name_ name of the prouduct.
     *@param symbol_ not necessarily needed(just provided in case, if not made something default explicity)
     *@param warrantyPeriod_ the timeInterval for the warranty to be available on the product
     *@param ProductURI the takenURI of the metadata file of a product(metadata generated, when a seller add products of its details)
     */
    constructor(
        address seller,
        string memory name_,
        string memory symbol_,
        uint256 warrantyPeriod_,
        uint256 quantity_,
        string memory ProductURI
    ) ERC721(name_, symbol_) {
        i_seller = seller;
        s_warrantyPeriod = warrantyPeriod_;
        s_quantity = quantity_;
        s_productURI = ProductURI;
    }

    /**
     *@dev returns the warranty period in seconds(conversion needs to be done in front end)
     */
    function getWarrantyPeriod() public view returns (uint256) {
        return s_warrantyPeriod;
    }

    /**
     *@dev function to change the warranty Period, 
      (This functionality only used for testing, should be deprecated)
     */
    function changeWarrantyPeriod(uint256 newWarrantyPeriod) public onlyOwner(msg.sender) {
        s_warrantyPeriod = newWarrantyPeriod;
    }

    /**
     *@dev Basic getter functions
     */
    function getCreationTime(uint256 tokenId_) public view returns (uint256) {
        return s_buyingTime[tokenId_];
    }

    function getSeller() public view returns (address) {
        return i_seller;
    }

    function inWarranty(uint256 tokenId_) public view returns (bool) {
        bool first = (warrantyStatus[tokenId_] == warrantyState.inWarranty);
        bool second = (block.timestamp - s_buyingTime[tokenId_] < s_warrantyPeriod);
        return (first && second);
    }

    function numberOfSoldUnits() public view returns (uint256) {
        return uint256(s_tokenIds.current());
    }

    function numberOfUnits() public view returns (uint256) {
        return s_quantity;
    }

    function addStock(uint256 quantityAdded) public {
        s_quantity += quantityAdded;
    }

    /**
     *@dev Changes the warranty status (example inWarranty can be changed when warrantyPeriod expires)
     */
    function changeWarrantyStatus(uint256 tokenId_, uint256 newWarrantyState)
        external
        onlyOwner(msg.sender)
    {
        warrantyStatus[tokenId_] = warrantyState(newWarrantyState);
    }

    /** @dev Mints a Warranty NFT (on purchase of product) to _buyer
     * Needs to be called by Product Owner when buying confirmation happens*/
    function mint() public stockAvailable returns (uint256) {
        uint256 newTokenId = s_tokenIds.current();
        _safeMint(address(msg.sender), newTokenId);
        _setTokenURI(newTokenId, s_productURI);
        s_tokenIds.increment();

        // Setting the helper values
        s_buyingTime[newTokenId] = block.timestamp;
        s_tokenIdValid[newTokenId] = true;

        emit ProductBought(s_buyingTime[newTokenId], s_buyingTime[newTokenId] + s_warrantyPeriod);
        s_quantity--;
        warrantyStatus[newTokenId] = warrantyState.inWarranty;
        return newTokenId;
    }
}
