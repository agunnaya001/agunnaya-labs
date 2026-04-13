// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ArenaChampionV2
 * @notice Agunnaya Labs — Arena Champion NFTs (ERC-721) · Base Mainnet
 * @dev Full ERC-721 with enumerable, tokenURI storage, ERC-2981 royalties,
 *      and contractURI for OpenSea collection-level metadata.
 *      Champions are minted by the owner or through public mint.
 *
 * Collection: https://opensea.io/collection/arena-champion
 * Deployer:   0xFfb6505912FCE95B42be4860477201bb4e204E9f
 */
contract ArenaChampionV2 is ERC721, ERC721URIStorage, ERC721Enumerable, ERC2981, Ownable {
    // ── State ──────────────────────────────────────────────────────────────────
    uint256 private _nextTokenId = 1;
    uint256 public  constant MAX_SUPPLY   = 1000;
    uint256 public  publicMintPrice       = 0.005 ether;
    bool    public  publicMintEnabled     = false;
    string  private _contractURI;

    // ── Champion attributes ────────────────────────────────────────────────────
    struct Champion {
        string  name;
        string  rarity;   // Legendary / Epic / Rare / Common
        uint256 power;    // 1-100
        string  element;
    }
    mapping(uint256 => Champion) public champions;

    // ── Events ────────────────────────────────────────────────────────────────
    event ChampionMinted(address indexed to, uint256 indexed tokenId, string name, string rarity, uint256 power);
    event PublicMintToggled(bool enabled);
    event MintPriceUpdated(uint256 newPrice);

    // ── Constructor ────────────────────────────────────────────────────────────
    constructor(address initialOwner, string memory contractURIStr)
        ERC721("Arena Champion", "CHAMP")
        Ownable(initialOwner)
    {
        _contractURI = contractURIStr;
        // 5% royalty to owner (ERC-2981)
        _setDefaultRoyalty(initialOwner, 500);
    }

    // ── Owner mint (genesis champions with IPFS metadata) ──────────────────────
    function ownerMint(
        address to,
        string memory tokenURIStr,
        string memory champName,
        string memory rarity,
        uint256 power,
        string memory element
    ) external onlyOwner {
        require(_nextTokenId <= MAX_SUPPLY, "Max supply reached");
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURIStr);
        champions[tokenId] = Champion(champName, rarity, power, element);
        emit ChampionMinted(to, tokenId, champName, rarity, power);
    }

    // ── Public mint ────────────────────────────────────────────────────────────
    function publicMint(string memory tokenURIStr) external payable {
        require(publicMintEnabled, "Public mint not active");
        require(msg.value >= publicMintPrice, "Insufficient ETH");
        require(_nextTokenId <= MAX_SUPPLY, "Max supply reached");
        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURIStr);
        champions[tokenId] = Champion("Arena Champion", "Common", 50, "Unknown");
        emit ChampionMinted(msg.sender, tokenId, "Arena Champion", "Common", 50);
    }

    // ── Admin ──────────────────────────────────────────────────────────────────
    function setPublicMint(bool enabled) external onlyOwner {
        publicMintEnabled = enabled;
        emit PublicMintToggled(enabled);
    }

    function setMintPrice(uint256 newPrice) external onlyOwner {
        publicMintPrice = newPrice;
        emit MintPriceUpdated(newPrice);
    }

    function setContractURI(string memory uri) external onlyOwner {
        _contractURI = uri;
    }

    function setRoyalty(address receiver, uint96 feeBasisPoints) external onlyOwner {
        _setDefaultRoyalty(receiver, feeBasisPoints);
    }

    function withdraw() external onlyOwner {
        (bool ok, ) = payable(owner()).call{value: address(this).balance}("");
        require(ok, "Withdraw failed");
    }

    // ── OpenSea collection-level metadata ─────────────────────────────────────
    function contractURI() public view returns (string memory) {
        return _contractURI;
    }

    // ── View helpers ──────────────────────────────────────────────────────────
    function nextTokenId() external view returns (uint256) {
        return _nextTokenId;
    }

    function tokensOfOwner(address owner_) external view returns (uint256[] memory) {
        uint256 bal = balanceOf(owner_);
        uint256[] memory ids = new uint256[](bal);
        for (uint256 i = 0; i < bal; i++) ids[i] = tokenOfOwnerByIndex(owner_, i);
        return ids;
    }

    // ── Required overrides ────────────────────────────────────────────────────
    function supportsInterface(bytes4 interfaceId)
        public view override(ERC721, ERC721Enumerable, ERC721URIStorage, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function tokenURI(uint256 tokenId)
        public view override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function _update(address to, uint256 tokenId, address auth)
        internal override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }
}
